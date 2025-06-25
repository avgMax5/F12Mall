docker rm -f f12mall-be || true; \
docker build . -t f12mall-be:latest; \
docker run -d -p 5000:8080 --name f12mall-be f12mall-be:latest