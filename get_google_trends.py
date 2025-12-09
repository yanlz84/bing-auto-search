import json
import re
import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType

def get_google_trends():
    url = "https://trends.google.com/trending?geo=US"
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 无头模式
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    try:
        # 在GitHub Actions环境中，使用Chromium
        # 使用webdriver-manager自动管理驱动，指定ChromeType.CHROMIUM
        service = Service(ChromeDriverManager(chrome_type=ChromeType.CHROMIUM).install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.get(url)
        
        # 等待趋势表格加载
        wait = WebDriverWait(driver, 30)
        # 尝试定位趋势项，使用已知的类名
        # 根据页面结构，趋势标题可能在类名为 'tB5Jxf' 或 'enOdEe-wZVHld-zg7Cn' 的元素内
        # 我们可以等待表格行出现
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table.enOdEe-wZVHld-zg7Cn")))
        
        # 提取趋势标题
        # 查找所有包含趋势标题的单元格
        # 使用更具体的选择器：第一列包含趋势标题
        titles = []
        rows = driver.find_elements(By.CSS_SELECTOR, "table.enOdEe-wZVHld-zg7Cn tbody tr")
        for row in rows:
            # 跳过加载行
            if "enOdEe-wZVHld-taqlgf" in row.get_attribute("class"):
                continue
            # 第一列是趋势标题
            cells = row.find_elements(By.CSS_SELECTOR, "td")
            if len(cells) >= 2:
                title_cell = cells[1]  # 第二列是趋势标题
                title = title_cell.text.strip()
                if title:
                    titles.append(title)
        
        # 如果通过上述方法未找到，尝试备用选择器
        if len(titles) == 0:
            # 尝试查找类名为 'tB5Jxf' 的元素
            elements = driver.find_elements(By.CSS_SELECTOR, ".tB5Jxf")
            for el in elements:
                text = el.text.strip()
                if text:
                    titles.append(text)
        
        # 去重并限制为50条
        seen = set()
        unique_titles = []
        for title in titles:
            if title not in seen:
                seen.add(title)
                unique_titles.append(title)
            if len(unique_titles) >= 50:
                break
        
        driver.quit()
        
        # 保存到文件
        with open('google_trends.json', 'w', encoding='utf-8') as f:
            json.dump(unique_titles, f, ensure_ascii=False, indent=2)
        
        print(f"成功获取 {len(unique_titles)} 条Google趋势")
        return unique_titles
        
    except Exception as e:
        print(f"获取Google趋势失败: {e}")
        try:
            driver.quit()
        except:
            pass
        return None

def update_google_js(trends):
    if not trends:
        print("没有趋势数据，跳过更新google.js")
        return False
    
    try:
        with open('google.js', 'r', encoding='utf-8') as f:
            js_content = f.read()
        
        # 提取并更新版本号（与bing.js相同模式）
        version_match = re.search(r'@version\s+V(\d+)\.(\d+)\.(\d+)', js_content)
        if version_match:
            major, minor, patch = map(int, version_match.groups())
            new_patch = patch + 1
            new_version = f"V{major}.{minor}.{new_patch}"
            js_content = re.sub(
                r'(@version\s+)V\d+\.\d+\.\d+',
                f'\\g<1>{new_version}',
                js_content
            )
        
        # 提取原default_search_words数组
        old_array_match = re.search(r'var default_search_words = (\[.*?\])', js_content, re.DOTALL)
        if old_array_match:
            old_array_str = old_array_match.group(1)
            # 替换default_search_words数组
            new_js_content = js_content.replace(
                'var default_search_words = ' + old_array_str,
                'var default_search_words = ' + json.dumps(trends, ensure_ascii=False)
            )
        else:
            print("未找到default_search_words数组，跳过更新")
            new_js_content = js_content
        
        with open('google.js', 'w', encoding='utf-8') as f:
            f.write(new_js_content)
        
        print("Google趋势已更新到google.js")
        return True
        
    except Exception as e:
        print(f"更新google.js失败: {e}")
        return False

if __name__ == "__main__":
    trends = get_google_trends()
    if trends:
        update_google_js(trends)