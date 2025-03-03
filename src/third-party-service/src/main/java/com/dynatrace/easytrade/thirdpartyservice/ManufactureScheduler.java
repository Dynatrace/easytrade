package com.dynatrace.easytrade.thirdpartyservice;

import com.dynatrace.easytrade.thirdpartyservice.models.*;
import com.dynatrace.easytrade.thirdpartyservice.models.status.CreditCardBody;
import com.dynatrace.easytrade.thirdpartyservice.models.status.ErrorBody;
import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.OpenFeatureAPI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class ManufactureScheduler extends BaseScheduler {
    private static final Logger logger = LoggerFactory.getLogger(ManufactureScheduler.class);
    private final int delayChance = 20;
    private static final List<ManufactureProcess> syncList = Collections.synchronizedList(new ArrayList<>());
    private final ServiceHelper serviceHelper;
    private final OpenFeatureAPI openFeatureAPI;

    public ManufactureScheduler(ServiceHelper serviceHelper, OpenFeatureAPI openFeatureAPI) {
        super("manufacture", Integer.parseInt(System.getenv("MANUFACTURE_DELAY")),
                Integer.parseInt(System.getenv("MANUFACTURE_RATE")));
        this.serviceHelper = serviceHelper;
        this.openFeatureAPI = openFeatureAPI;
    }

    @Override
    protected void run() {
        logger.info("Running ManufactureScheduler task!");

        try {
            ArrayList<ManufactureProcess> toBeRemoved = new ArrayList<>();
            for (ManufactureProcess process : syncList) {
                switch (process.getStatus()) {
                    case ISSUING:
                    case MANUFACTURE_ERROR:
                        processIssueAndErrorStatus(process);
                        break;
                    case CARD_CREATED:
                        CourierScheduler.addProcess(new CourierProcess(process.getRequest().creditCardOrderId()));
                        toBeRemoved.add(process);
                        logger.info("Card has been sent to the courier service.");
                        break;
                }
            }

            for (ManufactureProcess process : toBeRemoved) {
                syncList.remove(process);
            }
        } catch (Exception e) {
            logger.error("Caught exception while running ManufactureScheduler's task: " + e.getMessage(), e);
            return;
        }

        logger.info("Finished ManufactureScheduler task!");

        randomFixedRatePlusSleep();
    }

    private CreditCardBody generateCardDetails(String cardLevel) {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.YEAR, 3);

        return new CreditCardBody(
                cardLevel,
                String.format("%05d%06d%05d",
                        random.nextInt(100000), random.nextInt(1000000), random.nextInt(100000)),
                String.format("%03d", random.nextInt(1000)),
                OffsetDateTime.ofInstant(cal.getTime().toInstant(), cal.getTimeZone().toZoneId()));
    }

    private void processIssueAndErrorStatus(ManufactureProcess process) {
        final Client client = openFeatureAPI.getClient();

        if (client.getBooleanValue("factory_crisis", false)) {
            logger.info("There is a problem in factory and all credit cards fail right now!");
            if (process.getStatus() != ManufactureStatus.MANUFACTURE_ERROR) {
                process.setStatus(ManufactureStatus.MANUFACTURE_ERROR);
                serviceHelper.updateStatus(OrderStatus.CARD_ERROR, process.getRequest().creditCardOrderId(),
                        ErrorBody.FACTORY_FAILURE);
                logger.info("Delay information has been passed to the credit card order service.");
            }
            return;
        }

        if (random.nextInt(100) < delayChance) {
            ErrorBody errorBody = random.nextInt(2) == 0 ? ErrorBody.DELAY_ON_CHIPS : ErrorBody.FACTORY_FAILURE;
            process.setStatus(ManufactureStatus.MANUFACTURE_ERROR);
            logger.info("There was a delay during card creation!");

            serviceHelper.updateStatus(OrderStatus.CARD_ERROR, process.getRequest().creditCardOrderId(), errorBody);
            logger.info("Delay information has been passed to the credit card order service.");
        } else {
            CreditCardBody cardBody = generateCardDetails(process.getRequest().cardLevel());
            process.setCardDetails(cardBody);
            process.setStatus(ManufactureStatus.CARD_CREATED);
            logger.info("Card has been created!");

            serviceHelper.updateStatus(OrderStatus.CARD_CREATED, process.getRequest().creditCardOrderId(), cardBody);
            logger.info("Card details and status has been updated in credit card order service.");
        }
    }

    public static void addProcess(ManufactureProcess process) {
        syncList.add(process);
    }
}
