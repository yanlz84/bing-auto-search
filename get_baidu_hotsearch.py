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
            
        print("百度热搜获取成功，已保存到baidu_hotsearch.json")
        return True
        
    except Exception as e:
        print(f"获取百度热搜失败: {e}")
        return False

if __name__ == "__main__":
    get_baidu_hotsearch()
