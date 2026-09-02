package com.dynatrace.easytrade.creditcardorderservice;

import com.dynatrace.easytrade.dbadapter.creditcardorder.grpc.CreditCardOrderServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PreDestroy;

@Configuration
public class GrpcClientConfig {

    private ManagedChannel dbAdapterChannel;

    @Bean
    public ManagedChannel dbAdapterChannel(@Value("${DB_ADAPTER_ADDRESS}") String target) {
        this.dbAdapterChannel = ManagedChannelBuilder.forTarget(target).usePlaintext().build();
        return this.dbAdapterChannel;
    }

    @Bean
    public CreditCardOrderServiceGrpc.CreditCardOrderServiceBlockingStub creditCardOrderServiceStub(
            ManagedChannel dbAdapterChannel) {
        return CreditCardOrderServiceGrpc.newBlockingStub(dbAdapterChannel);
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        if (this.dbAdapterChannel != null && !this.dbAdapterChannel.isShutdown()) {
            this.dbAdapterChannel.shutdown().awaitTermination(5, java.util.concurrent.TimeUnit.SECONDS);
        }
    }
}
