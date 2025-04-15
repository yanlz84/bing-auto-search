import requests
from bs4 import BeautifulSoup
import json

def get_baidu_hotsearch():
    url = "https://top.baidu.com/board?tab=realtime"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        # 获取网页内容
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # 解析HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        titles = [item.text.strip() for item in soup.select('.c-single-text-ellipsis')]
        print(f"找到{len(titles)}个匹配项")
        # 保存到文件
        with open('baidu_hotsearch.json', 'w', encoding='utf-8') as f:
            json.dump(titles, f, ensure_ascii=False, indent=2)
            
        # 更新bing.js中的搜索词
        with open('bing.js', 'r', encoding='utf-8') as f:
            js_content = f.read()
            
        # 提取原default_search_words数组
        import re
        old_array_match = re.search(r'var default_search_words = (\[.*?\])', js_content)
        if old_array_match:
            old_array_str = old_array_match.group(1)
            # 替换default_search_words数组
            new_js_content = js_content.replace(
                'var default_search_words = ' + old_array_str,
                'var default_search_words = ' + json.dumps(titles, ensure_ascii=False)
            )
        else:
            print("未找到default_search_words数组，跳过更新")
            new_js_content = js_content
        
        with open('bing.js', 'w', encoding='utf-8') as f:
            f.write(new_js_content)
            
        print("百度热搜获取成功，已保存到baidu_hotsearch.json并更新bing.js")
        return True
        
    except Exception as e:
        print(f"获取百度热搜失败: {e}")
        return False

if __name__ == "__main__":
    get_baidu_hotsearch()
