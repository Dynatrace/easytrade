package com.dynatrace.easytrade.creditcardorderservice;

import com.dynatrace.easytrade.creditcardorderservice.models.*;
import com.dynatrace.easytrade.dbadapter.creditcardorder.grpc.*;
import com.google.protobuf.Empty;
import com.google.protobuf.Timestamp;
import com.google.protobuf.util.Timestamps;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Component
public class DbAdapterClient {
    private static final Logger logger = LoggerFactory.getLogger(DbAdapterClient.class);

    private final CreditCardOrderServiceGrpc.CreditCardOrderServiceBlockingStub stub;

    public DbAdapterClient(CreditCardOrderServiceGrpc.CreditCardOrderServiceBlockingStub stub) {
        this.stub = stub;
    }

    public boolean hasExistingOrder(Integer accountId) {
        try {
            return stub.existsByAccountId(existsByAccountIdToProto(accountId)).getExists();
        } catch (StatusRuntimeException e) {
            throw handleGrpcError("existsByAccountId", e);
        }
    }

    public String createOrder(CreditCardOrderRequest request) {
        try {
            return stub.createCreditCardOrder(toProto(request)).getId();
        } catch (StatusRuntimeException e) {
            throw handleGrpcError("createCreditCardOrder", e);
        }
    }

    public Optional<ShippingAddressResponse> getShippingAddress(String orderId) {
        try {
            ShippingAddressMessage msg = stub.getShippingAddressByOrderId(shippingAddressToProto(orderId));
            return Optional.of(shippingAddressFromProto(msg));
        } catch (StatusRuntimeException e) {
            return handleNotFound(e, Optional.empty());
        }
    }

    public Optional<CreditCardOrderStatusHistory> getStatusListByAccountId(Integer accountId) {
        try {
            List<CreditCardOrderStatusMessage> statuses = stub.getStatusListByAccountId(
                    statusListToProto(accountId)).getStatusesList();
            if (statuses.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(new CreditCardOrderStatusHistory(
                    statuses.get(0).getCreditCardOrderId(),
                    statuses.stream().map(this::fromProto).toList()));
        } catch (StatusRuntimeException e) {
            return handleNotFound(e, Optional.empty());
        }
    }

    public Optional<CreditCardOrderStatus> getLastOrderStatusByAccountId(Integer accountId) {
        try {
            return Optional.of(fromProto(
                    stub.getLastOrderStatusByAccountId(lastOrderStatusToProto(accountId))));
        } catch (StatusRuntimeException e) {
            return handleNotFound(e, Optional.empty());
        }
    }

    public Optional<CreditCardOrderStatus> getLastOrderStatusByOrderId(String orderId) {
        try {
            return Optional.of(fromProto(
                    stub.getLastOrderStatusByOrderId(lastOrderStatusToProto(orderId))));
        } catch (StatusRuntimeException e) {
            return handleNotFound(e, Optional.empty());
        }
    }

    public List<ManufactureRequest> getOrdersToManufacture() {
        try {
            return stub.getOrdersToManufacture(Empty.getDefaultInstance())
                    .getOrdersList()
                    .stream()
                    .map(this::fromProto)
                    .toList();
        } catch (StatusRuntimeException e) {
            throw handleGrpcError("getOrdersToManufacture", e);
        }
    }

    public void insertNewStatus(String orderId, StatusType statusType) {
        insertNewStatus(orderId, statusType, statusType.getDescription());
    }

    public void insertNewStatus(String orderId, StatusType statusType, String details) {
        try {
            stub.insertNewStatus(toProto(orderId, statusType, details));
        } catch (StatusRuntimeException e) {
            throw handleGrpcError("insertNewStatus", e);
        }
    }

    public void insertNewCreditCard(String orderId, CreditCardRequest request) {
        try {
            stub.insertNewCreditCard(toProto(orderId, request));
        } catch (StatusRuntimeException e) {
            throw handleGrpcError("insertNewCreditCard", e);
        }
    }

    public void updateOrderShippingId(String orderId, ShippingIdRequest request) {
        try {
            stub.updateOrderShippingId(toProto(orderId, request));
        } catch (StatusRuntimeException e) {
            throw handleGrpcError("updateOrderShippingId", e);
        }
    }

    public int deleteOrdersByAccountId(Integer accountId) {
        try {
            return stub.deleteOrdersByAccountId(deleteOrdersToProto(accountId)).getAffected();
        } catch (StatusRuntimeException e) {
            throw handleGrpcError("deleteOrdersByAccountId", e);
        }
    }

    private CreateCreditCardOrderRequest toProto(CreditCardOrderRequest request) {
        return CreateCreditCardOrderRequest.newBuilder()
                .setAccountId(request.accountId().toString())
                .setEmail(request.email())
                .setName(request.name())
                .setShippingAddress(request.shippingAddress())
                .setCardLevel(request.cardLevel())
                .build();
    }

    private ExistsByAccountIdRequest existsByAccountIdToProto(Integer accountId) {
        return ExistsByAccountIdRequest.newBuilder()
                .setAccountId(accountId.toString())
                .build();
    }

    private GetShippingAddressRequest shippingAddressToProto(String orderId) {
        return GetShippingAddressRequest.newBuilder().setOrderId(orderId).build();
    }

    private GetStatusListByAccountIdRequest statusListToProto(Integer accountId) {
        return GetStatusListByAccountIdRequest.newBuilder()
                .setAccountId(accountId.toString())
                .build();
    }

    private GetLastOrderStatusByAccountIdRequest lastOrderStatusToProto(Integer accountId) {
        return GetLastOrderStatusByAccountIdRequest.newBuilder()
                .setAccountId(accountId.toString())
                .build();
    }

    private GetLastOrderStatusByOrderIdRequest lastOrderStatusToProto(String orderId) {
        return GetLastOrderStatusByOrderIdRequest.newBuilder()
                .setOrderId(orderId)
                .build();
    }

    private ManufactureRequest fromProto(CreditCardManufactureDataMessage msg) {
        return new ManufactureRequest(msg.getOrderId(), msg.getName(), msg.getCardLevel());
    }

    private InsertNewStatusRequest toProto(String orderId, StatusType statusType,
            String details) {
        return InsertNewStatusRequest.newBuilder()
                .setOrderId(orderId)
                .setStatus(statusType.getType())
                .setDetails(details)
                .setTimestamp(toProtoTimestamp(Instant.now()))
                .build();
    }

    private InsertNewCreditCardRequest toProto(String orderId, CreditCardRequest request) {
        return InsertNewCreditCardRequest.newBuilder()
                .setOrderId(orderId)
                .setCardLevel(request.cardLevel())
                .setCardNumber(request.cardNumber())
                .setCardCvs(request.cardCVS())
                .setCardValidDate(toProtoTimestamp(request.cardValidDate().toInstant()))
                .build();
    }

    private UpdateOrderShippingIdRequest toProto(String orderId,
            ShippingIdRequest request) {
        return UpdateOrderShippingIdRequest.newBuilder()
                .setOrderId(orderId)
                .setShippingId(request.shippingId())
                .build();
    }

    private DeleteOrdersRequest deleteOrdersToProto(Integer accountId) {
        return DeleteOrdersRequest.newBuilder()
                .setAccountId(accountId.toString())
                .build();
    }

    private ShippingAddressResponse shippingAddressFromProto(ShippingAddressMessage msg) {
        return new ShippingAddressResponse(msg.getShippingAddress(), msg.getName(), msg.getEmail());
    }

    private CreditCardOrderStatus fromProto(CreditCardOrderStatusMessage msg) {
        OffsetDateTime datetime = OffsetDateTime.ofInstant(
                Instant.ofEpochSecond(msg.getTimestamp().getSeconds(), msg.getTimestamp().getNanos()),
                ZoneOffset.UTC);
        return new CreditCardOrderStatus(
                Integer.parseInt(msg.getId()),
                msg.getCreditCardOrderId(),
                datetime,
                msg.getStatus(),
                msg.getDetails());
    }

    private Timestamp toProtoTimestamp(Instant instant) {
        return Timestamps.fromMillis(instant.toEpochMilli());
    }

    private <T> T handleNotFound(StatusRuntimeException e, T defaultValue) {
        if (e.getStatus().getCode() == Status.Code.NOT_FOUND) {
            return defaultValue;
        }
        throw handleGrpcError("request", e);
    }

    private RuntimeException handleGrpcError(String operation, StatusRuntimeException e) {
        String message = String.format("gRPC call failed for %s: %s", operation, e.getStatus());
        logger.error(message, e);
        return new DbAdapterException(message, e);
    }
}
