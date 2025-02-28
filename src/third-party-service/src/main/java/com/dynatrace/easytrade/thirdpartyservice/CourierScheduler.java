package com.dynatrace.easytrade.thirdpartyservice;

import com.dynatrace.easytrade.thirdpartyservice.models.CourierProcess;
import com.dynatrace.easytrade.thirdpartyservice.models.CourierStatus;
import com.dynatrace.easytrade.thirdpartyservice.models.OrderStatus;
import com.dynatrace.easytrade.thirdpartyservice.models.ShippingAddress;
import com.dynatrace.easytrade.thirdpartyservice.models.status.ShippingIdBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CourierScheduler extends BaseScheduler {
    private static final Logger logger = LoggerFactory.getLogger(CourierScheduler.class);
    private static final List<CourierProcess> syncList = Collections.synchronizedList(new ArrayList<>());
    private final ServiceHelper serviceHelper;

    public CourierScheduler(ServiceHelper serviceHelper) {
        super("courier", Integer.parseInt(System.getenv("COURIER_DELAY")),
                Integer.parseInt(System.getenv("COURIER_RATE")));
        this.serviceHelper = serviceHelper;
    }

    @Override
    protected void run() {
        logger.info("Running CourierScheduler task!");

        try {
            ArrayList<CourierProcess> toBeRemoved = new ArrayList<>();
            for (CourierProcess process : syncList) {
                switch (process.getStatus()) {
                    case NEW_CARD_RECEIVED:
                        processNewCardReceivedStatus(process);
                        break;
                    case CARD_SENT:
                        processCardSentStatus(process);
                        break;
                    case CARD_DELIVERED:
                        toBeRemoved.add(process);
                        logger.info("All actions have been done, removing order information.");
                        break;
                }
            }

            for (CourierProcess process : toBeRemoved) {
                syncList.remove(process);
            }
        } catch (Exception e) {
            logger.error("Caught exception while running CourierScheduler's task: " + e.getMessage(), e);
            return;
        }

        logger.info("Finished CourierScheduler task!");

        randomFixedRatePlusSleep();
    }

    private void processNewCardReceivedStatus(CourierProcess process) {
        ShippingAddress shippingAddress = serviceHelper.getShippingAddress(process.getCreditCardOrderId());
        if (shippingAddress != null) {
            process.setAddress(shippingAddress);
            process.setStatus(CourierStatus.CARD_SENT);
            logger.info("Card has been shipped to the customer.");

            String guid = UUID.randomUUID().toString();
            process.setShippingId(guid);
            serviceHelper.updateStatus(OrderStatus.CARD_SHIPPED, process.getCreditCardOrderId(),
                    new ShippingIdBody(guid));
            logger.info("Sent shipping id info to the credit card order service.");
        } else {
            logger.info("Could not find shipping address for order: {}", process.getCreditCardOrderId());
        }
    }

    private void processCardSentStatus(CourierProcess process) {
        process.setStatus(CourierStatus.CARD_DELIVERED);
        logger.info("Card has been delivered to the customer.");

        serviceHelper.updateStatus(OrderStatus.CARD_DELIVERED, process.getCreditCardOrderId(), null);
        logger.info("Credit card order status updates - card has been delivered.");
    }

    public static void addProcess(CourierProcess process) {
        syncList.add(process);
    }
}
