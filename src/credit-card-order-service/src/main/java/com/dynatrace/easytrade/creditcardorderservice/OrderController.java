package com.dynatrace.easytrade.creditcardorderservice;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dynatrace.easytrade.creditcardorderservice.models.CreditCardOrderRequest;
import com.dynatrace.easytrade.creditcardorderservice.models.CreditCardOrderResponse;
import com.dynatrace.easytrade.creditcardorderservice.models.CreditCardOrderStatus;
import com.dynatrace.easytrade.creditcardorderservice.models.CreditCardOrderStatusHistory;
import com.dynatrace.easytrade.creditcardorderservice.models.CreditCardRequest;
import com.dynatrace.easytrade.creditcardorderservice.models.ErrorRequest;
import com.dynatrace.easytrade.creditcardorderservice.models.ShippingAddressResponse;
import com.dynatrace.easytrade.creditcardorderservice.models.ShippingIdRequest;
import com.dynatrace.easytrade.creditcardorderservice.models.StandardResponse;
import com.dynatrace.easytrade.creditcardorderservice.models.StatusRequest;
import com.dynatrace.easytrade.creditcardorderservice.models.StatusType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.OpenFeatureAPI;

@RestController
@RequestMapping(value = "/v1/orders", produces = { "application/json", "application/xml" })
@CrossOrigin
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    private static final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    public static final String ORDER_IDS_DO_NOT_MATCH = "Credit card order found in path and request body don't match!";
    public static final String NO_STATUS_FOR_ID = "There does not exist a status for the credit card order: %s";
    public static final String STATUS_UPDATED = "Credit card order status updated successfully.";
    public static final String UNKNOWN_STATUS_CHANGE = "This status change is somehow unsupported? Tried to update from %s to %s!";
    public static final String WRONG_SEQUENCE = "%s Tried to update from %s to %s!";
    public static final String ORDER_CREATED = "Credit card order has been created.";
    public static final String ORDER_ALREADY_EXISTS = "A credit card order for given accountId already exists!";
    private final DbAdapterClient dbAdapterClient;
    private final OpenFeatureAPI openFeatureAPI;

    public OrderController(DbAdapterClient dbAdapterClient, OpenFeatureAPI openFeatureAPI) {
        this.dbAdapterClient = dbAdapterClient;
        this.openFeatureAPI = openFeatureAPI;
    }

    @PostMapping(value = "", consumes = { "application/json", "application/xml" })
    public ResponseEntity<StandardResponse> createCreditCardOrder(@RequestBody CreditCardOrderRequest request) {
        logger.info("Starting to create a credit card order for data: " + request);
        try {
            if (!dbAdapterClient.hasExistingOrder(request.accountId())) {
                String guid = dbAdapterClient.createOrder(request);
                dbAdapterClient.insertNewStatus(guid, StatusType.ORDER_CREATED);
                return buildResponseEntity(HttpStatus.CREATED, ORDER_CREATED,
                        new CreditCardOrderResponse(guid), null, null);
            } else {
                return buildResponseEntity(HttpStatus.BAD_REQUEST, ORDER_ALREADY_EXISTS,
                        null, request, null);
            }
        } catch (RuntimeException e) {
            return handleException(e);
        }
    }

    @GetMapping("/{id}/shipping-address")
    public ResponseEntity<StandardResponse> getShippingAddress(@PathVariable String id) {
        logger.info("Finding shipping address for order: " + id);
        try {
            Optional<ShippingAddressResponse> response = dbAdapterClient.getShippingAddress(id);
            return response
                    .map(r -> buildResponseEntity(HttpStatus.OK, "Address found successfully.", r))
                    .orElse(buildResponseEntity(HttpStatus.NOT_FOUND, "There is no address for given order id."));
        } catch (RuntimeException e) {
            return handleException(e);
        }
    }

    @GetMapping("/{accountId}/status")
    public ResponseEntity<StandardResponse> getStatusHistory(@PathVariable Integer accountId) {
        logger.info("Getting status history for accountId: " + accountId);
        try {
            Optional<CreditCardOrderStatusHistory> history = dbAdapterClient.getStatusListByAccountId(accountId);
            return history
                    .map(h -> buildResponseEntity(HttpStatus.OK, "Status history found", h))
                    .orElse(buildResponseEntity(HttpStatus.NOT_FOUND,
                            "Status history for account [" + accountId + "] not found"));
        } catch (RuntimeException e) {
            return handleException(e);
        }
    }

    @GetMapping("/{accountId}/status/latest")
    public ResponseEntity<StandardResponse> getLatestStatus(@PathVariable Integer accountId) {
        logger.info("Getting latest status for accountId: " + accountId);
        try {
            final Client client = openFeatureAPI.getClient();
            if (client.getBooleanValue("credit_card_meltdown", false)) {
                CountSequenceTotal(5, 2, 14);
            }

            Optional<CreditCardOrderStatus> status = dbAdapterClient.getLastOrderStatusByAccountId(accountId);
            return status
                    .map(s -> buildResponseEntity(HttpStatus.OK, "Status found successfully.", s))
                    .orElse(buildResponseEntity(HttpStatus.NOT_FOUND,
                            "Status for the given account id does not exist!"));
        } catch (RuntimeException e) {
            return handleException(e);
        } catch (Exception e) {
            logger.error("Exception occured", e);
            throw e;
        }
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<StandardResponse> deleteOrder(@PathVariable Integer accountId) {
        logger.info("Deleting order and/or card for accountId: " + accountId);
        try {
            dbAdapterClient.deleteOrdersByAccountId(accountId);
            return buildResponseEntity(HttpStatus.OK, "Order and/or card successfully deleted.");
        } catch (RuntimeException e) {
            return handleException(e);
        }
    }

    /**
     * CARD_CREATED sample JSON
     * {
     * "orderId": "d3bfb8ac-9ba5-433c-a431-06b64eac2162",
     * "type": "card_created",
     * "timestamp": "2023-05-31T14:12:12.830Z",
     * "details": {
     * "cardLevel": "silver",
     * "cardNumber": "1234567890123456",
     * "cardCVS": "647",
     * "cardValidDate": "2026-05-31T23:59:59.999Z"
     * }
     * }
     **/
    /**
     * CARD_ERROR sample JSON
     * {
     * "orderId": "6eff9bd6-777b-4278-bd62-c3cf5d5ef561",
     * "type": "card_error",
     * "timestamp": "2023-05-31T14:12:12.830Z",
     * "details": {
     * "errorType": "delay",
     * "errorCode": 22,
     * "errorMessage": "Factory failure"
     * }
     * }
     **/
    /**
     * CARD_SHIPPED sample JSON
     * {
     * "orderId": "d3bfb8ac-9ba5-433c-a431-06b64eac2162",
     * "type": "card_shipped",
     * "timestamp": "2023-05-31T14:12:12.830Z",
     * "details": {
     * "shippingId": "d3bfb8ac-9ba5-433c-a431-06b64eac2199"
     * }
     * }
     **/
    @PostMapping(value = "/{id}/status", consumes = { "application/json", "application/xml" })
    public ResponseEntity<StandardResponse> updateStatus(@PathVariable String id, @RequestBody StatusRequest request) {
        logger.info("Handling a status update of: " + request);
        if (!id.equals(request.orderId())) {
            return buildResponseEntity(HttpStatus.BAD_REQUEST, ORDER_IDS_DO_NOT_MATCH,
                    null, request, null);
        }
        try {
            return actOnNewStatus(request);
        } catch (RuntimeException e) {
            return handleException(e);
        }
    }

    private ResponseEntity<StandardResponse> actOnNewStatus(StatusRequest request) {
        StatusType newStatusType = StatusType.valueOf(request.type().toUpperCase());

        try {
            Optional<CreditCardOrderStatus> currentStatus = dbAdapterClient
                    .getLastOrderStatusByOrderId(request.orderId());
            if (currentStatus.isEmpty()) {
                return buildResponseEntity(HttpStatus.BAD_REQUEST, String.format(NO_STATUS_FOR_ID, request.orderId()));
            }

            StatusType oldStatusType = StatusType.valueOf(currentStatus.get().status().toUpperCase());

            if (newStatusType.getSequence() <= oldStatusType.getSequence()) {
                String message = String.format(WRONG_SEQUENCE, StatusType.SEQUENCE_ERROR.getDescription(),
                        oldStatusType.getType(), newStatusType.getType());
                return buildResponseEntity(HttpStatus.BAD_REQUEST, message);
            }
        } catch (RuntimeException e) {
            return handleException(e);
        }

        return applyStatusChange(request, newStatusType);
    }

    private ResponseEntity<StandardResponse> applyStatusChange(StatusRequest request, StatusType newStatusType) {
        switch (newStatusType) {
            case CARD_ORDERED:
            case CARD_DELIVERED:
                dbAdapterClient.insertNewStatus(request.orderId(), newStatusType);
                break;
            case CARD_ERROR:
                ErrorRequest errorRequest = mapper.convertValue(request.details().get(), ErrorRequest.class);
                dbAdapterClient.insertNewStatus(request.orderId(), newStatusType, String.format(
                        "There occurred an error of type '%s' and a code of '%d'. Error message: %s",
                        errorRequest.errorType(), errorRequest.errorCode(), errorRequest.errorMessage()));
                break;
            case CARD_SHIPPED:
                ShippingIdRequest shippingIdRequest = mapper.convertValue(request.details().get(),
                        ShippingIdRequest.class);
                dbAdapterClient.updateOrderShippingId(request.orderId(), shippingIdRequest);
                dbAdapterClient.insertNewStatus(request.orderId(), newStatusType);
                break;
            case CARD_CREATED:
                CreditCardRequest creditCardRequest = mapper.convertValue(request.details().get(),
                        CreditCardRequest.class);
                dbAdapterClient.insertNewCreditCard(request.orderId(), creditCardRequest);
                dbAdapterClient.insertNewStatus(request.orderId(), newStatusType);
                break;
            default:
                return buildResponseEntity(HttpStatus.BAD_REQUEST,
                        String.format(UNKNOWN_STATUS_CHANGE, newStatusType.getType()));
        }
        return buildResponseEntity(HttpStatus.OK, STATUS_UPDATED);
    }

    private ResponseEntity<StandardResponse> buildResponseEntity(HttpStatus status, String message) {
        return buildResponseEntity(status, message, null, null, null);
    }

    private ResponseEntity<StandardResponse> buildResponseEntity(HttpStatus status, String message, Object results) {
        return buildResponseEntity(status, message, results, null, null, false);
    }

    private ResponseEntity<StandardResponse> buildResponseEntity(HttpStatus status, String message, Object results,
            Object data, Object error) {
        return buildResponseEntity(status, message, results, data, error, false);
    }

    private ResponseEntity<StandardResponse> buildResponseEntity(HttpStatus status, String message, Object results,
            Object data, Object error, boolean logError) {
        if (logError) {
            logger.error(message);
        } else {
            logger.info(message);
        }

        return ResponseEntity
                .status(status)
                .body(new StandardResponse(
                        status.value(),
                        message,
                        results,
                        data,
                        error));
    }

    private ResponseEntity<StandardResponse> handleException(RuntimeException e) {
        return buildResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, "An exception occurred!",
                null, null, e.getMessage(), true);
    }

    private int CountSequenceTotal(int firstElement, int step, int count) {
        int tmpFirstElement = firstElement + 7;
        int tmpStep = step + 2;
        int tmpCount = count + 13;

        return CountArythmeticSequenceTotal(tmpFirstElement, tmpStep, tmpCount);
    }

    private int CountArythmeticSequenceTotal(int firstElement, int step, int count) {
        // this has a wrong value (normally would be 2), because we want to create an
        // exception!
        int theGreatDivider = 0;

        int lastElement = firstElement + (step * (count - 1));
        // deepcode ignore DivisionByZero: exception should be thrown here
        int total = (firstElement + lastElement) * count / theGreatDivider;

        return total;
    }
}
