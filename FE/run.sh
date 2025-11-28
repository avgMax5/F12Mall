docker rm -f dynamic_html_running || true; \
docker build . -t dynamic_html:latest; \
docker run -d -p 3000:3000 --name dynamic_html_running dynamic_html:latest # '원하는 포트:3000' 형태로 변경해서 사용