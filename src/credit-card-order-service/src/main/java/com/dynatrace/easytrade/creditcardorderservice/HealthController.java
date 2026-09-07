package com.dynatrace.easytrade.creditcardorderservice;

import io.grpc.ConnectivityState;
import io.grpc.ManagedChannel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final ManagedChannel dbAdapterChannel;

    public HealthController(ManagedChannel dbAdapterChannel) {
        this.dbAdapterChannel = dbAdapterChannel;
    }

    @GetMapping("/livez")
    public ResponseEntity<String> getLivez() {
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/readyz")
    public ResponseEntity<String> getReadyz() {
        if (dbAdapterChannel.getState(true) == ConnectivityState.READY) {
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Service Unavailable");
    }
}
