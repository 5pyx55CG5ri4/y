import requests
from bs4 import BeautifulSoup
import os

def get_image_urls(page_url):
    # 访问网页并解析内容
    response = requests.get(page_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    print(soup.prettify())
    # 获取所有的图片URL
    image_urls = []
    for img in soup.find_all('img'):
        img_url = img.get('src')
        if img_url:
            if not img_url.startswith('http'):
                # 处理相对URL
                img_url = os.path.join(page_url, img_url)
            image_urls.append(img_url)

    return image_urls

def download_image(img_url):
    # 下载图片并将其转换为二进制数据
    response = requests.get(img_url)
    return response.content

def upload_image(binary_data, upload_url):
    # 上传图片二进制文件到目标接口
    files = {'file': ('image.jpg', binary_data)}
    response = requests.post(upload_url, files=files)
    return response.status_code, response.text

def main():
    page_url = 'http://www.mtxzt.com/moterder/mtxztm/1_37.html#/'  # 替换为实际的网页URL
    upload_url = 'https://api.example.com/upload'  # 替换为实际的上传接口URL

    # 获取图片URL
    image_urls = get_image_urls(page_url)

    for img_url in image_urls:
        print(f"Processing {img_url}")
        binary_data = download_image(img_url)
        status_code, response_text = upload_image(binary_data, upload_url)
        print(f"Upload status: {status_code}, Response: {response_text}")

if __name__ == "__main__":
    main()
