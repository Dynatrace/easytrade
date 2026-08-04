#pragma once
#include <atomic>
#include <cstdint>
#include <event2/http.h>
#include <event2/buffer.h>

inline std::atomic<bool> amqp_connection_healthy{false};

inline void set_health_status(bool connected) {
    amqp_connection_healthy = connected;
}

struct HealthServer {
    struct evhttp *http;

    HealthServer(struct event_base *base, uint16_t port) {
        http = evhttp_new(base);
        evhttp_bind_socket(http, "0.0.0.0", port);
        evhttp_set_cb(http, "/livez", livez_request_handler, nullptr);
        evhttp_set_cb(http, "/readyz", readyz_request_handler, nullptr);
    }

    ~HealthServer() { if (http) evhttp_free(http); }

    HealthServer(const HealthServer &) = delete;
    HealthServer &operator=(const HealthServer &) = delete;

private:
    static void livez_request_handler(struct evhttp_request *req, void *) {
        struct evbuffer *buf = evbuffer_new();
        evbuffer_add_printf(buf, "OK");
        evhttp_send_reply(req, HTTP_OK, "OK", buf);
        evbuffer_free(buf);
    }

    static void readyz_request_handler(struct evhttp_request *req, void *) {
        if (amqp_connection_healthy.load()) {
            struct evbuffer *buf = evbuffer_new();
            evbuffer_add_printf(buf, "OK");
            evhttp_send_reply(req, HTTP_OK, "OK", buf);
            evbuffer_free(buf);
        } else {
            evhttp_send_reply(req, 503, "Service Unavailable", nullptr);
        }
    }
};
