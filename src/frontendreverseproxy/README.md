# easyTradeFrontendReverseProxy
An nginx reverse proxy. It is used for two things:   
- routing traffic for React frontend on kuberneted   
- expose services in kubernetes   

## Technologies used
- Nginx   
- Docker   

## Local build instructions
```bash
docker build -t easytradefrontendreverseproxy .
docker run -d --name frontendreverseproxy easytradefrontendreverseproxy
```   

## Endpoints or logic
Well ... this IS an nginx reverse proxy...
