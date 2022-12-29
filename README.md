# easytrade
A project consisting of many small services that connect to each other.   
It is made like a stock broking application - it allows it's users to buy&sell some stocks/instruments.   
Of course it is all fake data and the price has a 24 hour cycle...   

<br/><br/>

## Architecture diagram
<img src="./img/architecture.jpg" alt="EasyTrade architecture" width="1200"/>

<br/><br/>

## Database diagram
<img src="./img/database.jpg" alt="EasyTrade database" width="900"/>

<br/><br/>

## Service list
EasyTrade consists of the following services/components:
- [Account service](./docs/accountservice.md)
- [Aggregator service](./docs/aggregatorservice.md)
- [Broker service](./docs/brokerservice.md)
- [Calculation service](./docs/calculationservice.md)
- [Content creator](./docs/contentcreator.md)
- [Db](./docs/db.md)
- [Engine](./docs/engine.md)
- [Frontend](./docs/frontend.md)
- [Frontend reverse-proxy](./docs/frontendreverseproxy.md)
- [Login service](./docs/loginservice.md)
- [Manager](./docs/manager.md)
- [Offer service](./docs/offerservice.md)
- [Plugin service](./docs/pluginservice.md)
- [Pricing service](./docs/pricingservice.md)


If you want to learn more about these services, then go to their dedeciated markdown descriptions - just take note, that those readmes are more comprehensive and also contain the part about building which is currently not available for github sources :(

<br/><br/>

## Docker-compose instructions
In order to run easyTrade with the provided docker-compose file:
- make sure that you have docker and docker-compose installed. If not, do it.
- checkout this repository
- run the command `docker-compose up` or preferably `docker-compose up -d`
- wait a bit, and try it by going to "localhost", as the default frontend is available at port 80.

<br/><br/>

## Kubernetes instructions
In order to run easyTrade on kubernetes:
- make sure that you are on a machine with access to kubernetes. If not, do so.
- checkout this repository
- run the command `kubectl apply -f ./kubernetes-manifests`
- wait a bit, and try it by going to "localhost"/"MACHINE_IP", as the default frontend is available at port 80.

<br/><br/>

## Where to start
After starting easyTrade application you can:
- go to the frontend and try it out. Just go to the machines IP address, or "localhost" and you should see the login page. You can either create a new user, or use one of superusers (with easy passwords) like "demouser/demopass" or "specialuser/specialpass". Remember that in order to buy stocks you need money, so visit the deposit page first.
- go to some services swagger endpoint - you will find proper instructions in the dedicated service readmes. You can try to visit broker or manager as they have the most endpoints and both have swagger.
- after some time go to dynatrace to configure your application and see what is going on in easyTrade - to have it work you will need an agent on the machine you started easyTrade :P

<br/><br/>

