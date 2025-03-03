package com.dynatrace.easytrade.contentcreator;

import com.dynatrace.easytrade.contentcreator.models.Instruments;
import com.dynatrace.easytrade.contentcreator.models.Pricing;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PricingDataGeneratorTest {
    private PricingDataGenerator generator;
    private Logger LOGGER = LoggerFactory.getLogger(PricingDataGeneratorTest.class);

    @BeforeEach
    void setUp() {
        LOGGER.info("BeforeEach fired.");
        generator = new PricingDataGenerator();
    }

    @DisplayName("Single price generator test")
    @Test
    void generateSinglePricingData() {
        LOGGER.info("generateSinglePricingData started");

        Date now = new Date();

        LOGGER.info("Generating 2 pricing rows for the same date: " + now.getTime());
        Pricing price1 = generator.generateSinglePricingData(now, Instruments.BATBAT);
        Pricing price2 = generator.generateSinglePricingData(now, Instruments.BATBAT);
        LOGGER.info("Price1: " + price1.toString());
        LOGGER.info("Price2: " + price2.toString());

        LOGGER.info("Checking if opening/closing prices are the same while high/low are different");
        assertTrue(price1.getOpen() == price2.getOpen(),
                () -> "Opening prices generated for the same time should be equal");
        assertTrue(price1.getClose() == price2.getClose(),
                () -> "Closing prices generated for the same time should be equal");
        assertTrue(price1.getHigh() != price2.getHigh(),
                () -> "High prices generated for the same time should not be equal");
        assertTrue(price1.getLow() != price2.getLow(),
                () -> "Low prices generated for the same time should not be equal");

        LOGGER.info("generateSinglePricingData finished");
    }

    @DisplayName("Massive price generator test")
    @Test
    void generateMassivePricingData() {
        LOGGER.info("generateMassivePricingData started");

        Date now = new Date();
        int count = 33;

        LOGGER.info("Generating some pricing rows for the date: " + now.getTime());
        List<Pricing> data = generator.generateMassivePricingData(now, count, Instruments.BATBAT);

        LOGGER.info("Checking if the number of generated data is correct");
        assertTrue(count == data.size(), () -> "The number of prices generated is wrong");

        LOGGER.info("Checking if the data generated is logically sound");
        Pricing before = null;
        for (Pricing p : data) {
            if (before == null) {
                before = p;
                continue;
            }

            assertTrue(p.getOpen() == before.getClose(),
                    () -> "The current opening price should equal to last closing price.");

            before = p;
        }

        LOGGER.info("generateMassivePricingData finished");
    }
}