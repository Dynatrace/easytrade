FROM nginx:1.31.9-alpine3.24-slim@sha256:5bfced78d24d644270bedb0a9968697042e38d5c03fb6354603df025279c1cbe

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/templates/nginx.conf.template

EXPOSE 80

# Set default values for environment variables
ENV BROKER_SERVICE_URL=http://broker-service:8080 \
    USER_SERVICE_URL=http://user-service:8080 \
    PRICING_SERVICE_URL=http://pricing-service:8080 \
    OFFER_SERVICE_URL=http://offer-service:8080 \
    CREDIT_CARD_ORDER_SERVICE_URL=http://credit-card-order-service:8080 \
    BACKGROUND_SERVICE_URL=http://background-service:8080 \
    FEATURE_FLAG_SERVICE_URL=http://feature-flag-service:8080 \
    FRONTEND_URL=http://frontend:3000/ \
    FRONTEND_REVERSE_PROXY_PORT=80

CMD ["nginx", "-g", "daemon off;"]
