# easyTradeFrontendReverseProxy
An nginx reverse proxy. It is used for two things:   
- routing traffic for React frontend on kuberneted   
- expose services in kubernetes   

<br/><br/>

## Techs
Nginx   
Docker   

<br/><br/>

## Local build instructions
```sh
docker build -t easytradefrontendreverseproxy .
docker run -d --name frontendreverseproxy easytradefrontendreverseproxy
```   

<br/><br/>

## Endpoints or logic
Well ... this IS an nginx reverse proxy...

<br/><br/>




