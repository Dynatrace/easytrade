package com.dynatrace.easytrade.creditcardorderservice;

import com.dynatrace.easytrade.creditcardorderservice.models.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.OpenFeatureAPI;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.List;
import java.sql.*;

@RestController
@RequestMapping(value="/v1/orders", 
        produces={"application/json", "application/xml"})
@CrossOrigin
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status updated", content =
                @Content(schema = @Schema(implementation = StandardResponse.class))),
        @ApiResponse(responseCode = "400", description = "Bad request - check message and data for some hints", content =
                @Content(schema = @Schema(implementation = StandardResponse.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error - check message and error for details", content = 
                @Content(schema = @Schema(implementation = StandardResponse.class))),
})
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    public static final String ORDER_IDS_DO_NOT_MATCH = "Credit card order found in path and request body don't match!";
    public static final String NO_STATUS_FOR_ID = "There does not exist a status for the credit card order: %s";
    public static final String STATUS_UPDATED = "Credit card order status updated successfully.";
    public static final String UNKNOWN_STATUS_CHANGE = "This status change is somehow unsupported? Tried to update from %s to %s!";
    public static final String WRONG_SEQUENCE = "%s Tried to update from %s to %s!";
    public static final String ORDER_CREATED = "Credit card order has been created.";
    public static final String ORDER_ALREADY_EXISTS = "A credit card order for given accountId already exists!";
    private final DatabaseHelper dbHelper;
    private final OpenFeatureAPI openFeatureAPI;

    public OrderController(DatabaseHelper dbHelper, OpenFeatureAPI openFeatureAPI) {

        this.dbHelper = dbHelper;
        this.openFeatureAPI = openFeatureAPI;
    }

    @PostMapping(value="", consumes={"application/json", "application/xml"})
    @Operation(summary = "Order a credit card")
    public ResponseEntity<StandardResponse> createCreditCardOrder(@RequestBody CreditCardOrderRequest request) {
        logger.info("Starting to create a credit card order for data: " + request);
        try (Connection conn = dbHelper.getConnection()) {
            Integer orderCount = dbHelper.getOrderCountForAccountId(conn, request.accountId());

            if (orderCount == 0) {
                String guid = dbHelper.insertNewOrder(conn, request);
                dbHelper.insertNewStatus(conn, guid, StatusType.ORDER_CREATED);

                return buildResponseEntity(HttpStatus.CREATED, ORDER_CREATED,
                        new CreditCardOrderResponse(guid), null, null);
            } else {
                return buildResponseEntity(HttpStatus.BAD_REQUEST, ORDER_ALREADY_EXISTS,
                        null, request, null);
            }
        } catch (SQLException e) {
            return handleSQLException(e);
        }
    }

    @GetMapping("/{id}/shipping-address")
    @Operation(summary = "Get credit card's shipping address")
    public ResponseEntity<StandardResponse> getShippingAddress(@PathVariable String id) {
        logger.info("Finding shipping address for order: " + id);
        try (Connection conn = dbHelper.getConnection()) {
            Optional<ShippingAddressResponse> response = dbHelper.getShippingAddress(conn, id);
            return response
                    .map(r -> buildResponseEntity(HttpStatus.OK, "Address found successfully.", r))
                    .orElse(buildResponseEntity(HttpStatus.NOT_FOUND, "There is no address for given order id."));
        } catch (SQLException e) {
            return handleSQLException(e);
        }
    }

    @GetMapping("/{accountId}/status")
    @Operation(summary = "Get credit card order status history")
    public ResponseEntity<StandardResponse> getStatusHistory(@PathVariable Integer accountId) {
        logger.info("Getting status history for accountId: " + accountId);
        try (Connection conn = dbHelper.getConnection()) {
            Optional<String> orderId = dbHelper.getOrderIdForAccount(conn, accountId);
            if (orderId.isEmpty()) {
                return buildResponseEntity(HttpStatus.NOT_FOUND,
                        "Status history for account [" + accountId + "] not found");
            }
            List<CreditCardOrderStatus> statusList = dbHelper.getOrderStatusList(conn, orderId.get());
            return buildResponseEntity(HttpStatus.OK, "Status history found",
                    new CreditCardOrderStatusHistory(orderId.get(), statusList));
        } catch (SQLException e) {
            return handleSQLException(e);
        }
    }

    @GetMapping("/{accountId}/status/latest")
    @Operation(summary = "Get credit card order status")
    public ResponseEntity<StandardResponse> getLatestStatus(@PathVariable Integer accountId) {
        logger.info("Getting latest status for accountId: " + accountId);

        try (Connection conn = dbHelper.getConnection()) {
            final Client client = openFeatureAPI.getClient();
            if (client.getBooleanValue("credit_card_meltdown", false)) {
                CountSequenceTotal(5, 2, 14);
            }

            Optional<CreditCardOrderStatus> status = dbHelper.getLastOrderStatusForAccountId(conn, accountId);
            return status
                    .map(s -> buildResponseEntity(HttpStatus.OK, "Status found successfully.", status))
                    .orElse(buildResponseEntity(HttpStatus.NOT_FOUND,
                            "Status for the given account id does not exist!"));
        } catch (SQLException e) {
            return handleSQLException(e);
        } catch (Exception e) {
            logger.error("Exception occured", e);
            throw e;
        }
    }

    @DeleteMapping("/{accountId}")
    @Operation(summary = "Delete credit card order, status and credit card if any")
    public ResponseEntity<StandardResponse> deleteOrder(@PathVariable Integer accountId) {
        logger.info("Deleting order and/or card for accountId: " + accountId);
        try (Connection conn = dbHelper.getConnection()) {
            dbHelper.deleteOrderForAccountId(conn, accountId);

            return buildResponseEntity(HttpStatus.OK, "Order and/or card successfully deleted.",
                    null, null, null);
        } catch (SQLException e) {
            return handleSQLException(e);
        }
    }

    @PostMapping(value="/{id}/status", consumes={"application/json", "application/xml"})
    @Operation(summary = "Update the credit card order status")
    public ResponseEntity<StandardResponse> updateStatus(@PathVariable String id, @RequestBody StatusRequest request) {
        return handleNewStatus(id, request);
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
    private ResponseEntity<StandardResponse> handleNewStatus(String id, StatusRequest request) {
        logger.info("Handling a status update of: " + request);
        try (Connection conn = dbHelper.getConnection()) {
            if (!id.equals(request.orderId())) {
                return buildResponseEntity(HttpStatus.BAD_REQUEST, ORDER_IDS_DO_NOT_MATCH,
                        null, request, null);
            }

            CreditCardOrderStatus status = dbHelper.getLastOrderStatus(conn, id);

            if (status == null) {
                return buildResponseEntity(HttpStatus.BAD_REQUEST, String.format(NO_STATUS_FOR_ID, id),
                        null, null, null);
            }

            return actOnNewStatus(request, status);
        } catch (SQLException e) {
            return handleSQLException(e);
        }
    }

    private ResponseEntity<StandardResponse> actOnNewStatus(StatusRequest request, CreditCardOrderStatus status)
            throws SQLException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        StatusType newStatusType = StatusType.valueOf(request.type().toUpperCase());
        StatusType oldStatusType = StatusType.valueOf(status.status().toUpperCase());

        if (newStatusType.getSequence() <= oldStatusType.getSequence()) {
            String message = String.format(WRONG_SEQUENCE,
                    StatusType.SEQUENCE_ERROR.getDescription(),
                    oldStatusType.getType(),
                    newStatusType.getType());
            return buildResponseEntity(HttpStatus.BAD_REQUEST, message, null, null, null);
        }

        switch (newStatusType) {
            case CARD_ORDERED:
            case CARD_DELIVERED:
                dbHelper.insertNewStatus(request.orderId(), newStatusType);
                break;
            case CARD_ERROR:
                ErrorRequest errorRequest = mapper.convertValue(request.details().get(), ErrorRequest.class);
                dbHelper.insertNewStatus(request.orderId(), newStatusType, String.format(
                        "There occurred an error of type '%s' and a code of '%d'. Error message: %s",
                        errorRequest.errorType(), errorRequest.errorCode(), errorRequest.errorMessage()));
                break;
            case CARD_SHIPPED:
                ShippingIdRequest shippingIdRequest = mapper.convertValue(request.details().get(),
                        ShippingIdRequest.class);
                dbHelper.updateOrder(request.orderId(), shippingIdRequest);
                dbHelper.insertNewStatus(request.orderId(), newStatusType);
                break;
            case CARD_CREATED:
                CreditCardRequest creditCardRequest = mapper.convertValue(request.details().get(),
                        CreditCardRequest.class);
                dbHelper.insertNewCreditCard(request.orderId(), creditCardRequest);
                dbHelper.insertNewStatus(request.orderId(), newStatusType);
                break;
            default:
                String msg = String.format(UNKNOWN_STATUS_CHANGE, oldStatusType.getType(), newStatusType.getType());
                return buildResponseEntity(HttpStatus.BAD_REQUEST, msg, null, null, null);
        }

        return buildResponseEntity(HttpStatus.OK, STATUS_UPDATED,
                null, null, null);
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

    private ResponseEntity<StandardResponse> handleSQLException(SQLException e) {
        return buildResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, "An exception occurred!",
                null, null, e.getMessage(), true);
    }

    private int CountSequenceTotal(int firstElement, int step, int count)
    {
        int tmpFirstElement = firstElement + 7;
        int tmpStep = step + 2;
        int tmpCount = count + 13;

        return CountArythmeticSequenceTotal(tmpFirstElement, tmpStep, tmpCount);
    }

    private int CountArythmeticSequenceTotal(int firstElement, int step, int count)
    {
        // this has a wrong value (normally would be 2), because we want to create an exception!
        int theGreatDivider = 0;

        int lastElement = firstElement + (step * (count - 1));
        // deepcode ignore DivisionByZero: exception should be thrown here
        int total = (firstElement + lastElement) * count / theGreatDivider;

        return total;
    }
}
