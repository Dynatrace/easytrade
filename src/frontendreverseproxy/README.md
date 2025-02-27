# easyTradeFrontendReverseProxy

Nginx reverse proxy. It is used for two things:

- routing traffic for React frontend on kubernetes
- expose services in kubernetes

## Technologies used

- Docker
- Nginx

## Local build instructions

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```
