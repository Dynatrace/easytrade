# easyTradeFrontend
A frontend for easyTrade written in react.      

<br/><br/>

## Techs
React.js   
Javascript   
Docker   

<br/><br/>

## Local build instructions
```sh
docker build -t easytradefrontend .
docker run -d --name frontend easytradefrontend
```   

<br/><br/>

## Endpoints or logic
This project has no service endpoints apart from the frontend itself. Depending on how you run frontend it will be available at:   
 ```sh
 //started locally
 http://localhost:3000

 //started with docker-compose
 http://localhost

 //started on kubernetes
 http://SOMEWHERE
 ```

<br/><br/>