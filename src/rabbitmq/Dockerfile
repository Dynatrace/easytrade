FROM rabbitmq:3.13.7-management-alpine@sha256:a4c3e1b9ec43fddb486e3560d4dea0ac1d520d789b3fa22646850d05bd9c0e1f

COPY --chown=rabbitmq:rabbitmq ["rabbitmq.conf", "definitions.json", "/etc/rabbitmq/"]

CMD ["rabbitmq-server"]
