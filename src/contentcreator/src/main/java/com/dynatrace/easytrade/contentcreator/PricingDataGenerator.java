package com.dynatrace.easytrade.contentcreator;

import com.dynatrace.easytrade.contentcreator.models.HourValues;
import com.dynatrace.easytrade.contentcreator.models.Instruments;
import com.dynatrace.easytrade.contentcreator.models.Pricing;

import java.util.*;

public class PricingDataGenerator {
    private static Random random = new Random();

    public Pricing generateSinglePricingData(Date date, Instruments instrument) {
        List<Pricing> pricingData = generateMassivePricingData(date, 1, instrument);
        return pricingData.get(0);
    }

    public ArrayList<Pricing> generateMassivePricingData(Date date, int count, Instruments instrument) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        int time = (cal.get(Calendar.HOUR_OF_DAY) * 60 * 60) + (cal.get(Calendar.MINUTE) * 60)
                + cal.get(Calendar.SECOND);

        ArrayList<Pricing> pricingDataArrayList = new ArrayList<>();
        Pricing data;
        for (int i = 0; i < count; i++) {
            data = generateCandleData(time % 86400, instrument);
            data.setTimestamp(cal.getTime());
            pricingDataArrayList.add(data);

            time += 60;
            cal.add(Calendar.MINUTE, 1);
        }

        return pricingDataArrayList;
    }

    /**
     * Generate precise Pricing for the specific time of the day. The data keeps a
     * standard "shape" each day
     * 
     * @param time The second of the day
     * @return
     */
    private Pricing generateCandleData(int time, Instruments instrument) {
        Double opening = generatePrecisePricingData(time, instrument);
        Double closing = generatePrecisePricingData(time + 60, instrument);

        double difference = closing - opening;
        if (difference < instrument.getBaseDifference())
            difference = instrument.getBaseDifference();

        ArrayList<Double> valueList = new ArrayList<Double>();

        for (int i = 0; i < 60; i++) {
            valueList.add(opening + (((random.nextDouble() * 4) - 2.0) * difference));
        }

        return new Pricing(
                new java.sql.Date(13L),
                instrument.getInstrumentId(),
                opening.doubleValue(),
                Math.max(Math.max(Collections.max(valueList).doubleValue(), opening.doubleValue()),
                        closing.doubleValue()),
                Math.min(Math.min(Collections.min(valueList).doubleValue(), opening.doubleValue()),
                        closing.doubleValue()),
                closing.doubleValue());
    }

    private double generatePrecisePricingData(int time, Instruments instrument) {
        double startValue;
        double endValue;
        double step;
        int sectionTime;

        if (time == HourValues.H0.value || time == HourValues.H24.value) {
            return instrument.getTime0();
        } else if (time <= HourValues.H3.value) {
            startValue = instrument.getTime0();
            endValue = instrument.getTime3();
            sectionTime = time;
        } else if (time <= HourValues.H6.value) {
            startValue = instrument.getTime3();
            endValue = instrument.getTime6();
            sectionTime = time - HourValues.H3.value;
        } else if (time <= HourValues.H9.value) {
            startValue = instrument.getTime6();
            endValue = instrument.getTime9();
            sectionTime = time - HourValues.H6.value;
        } else if (time <= HourValues.H12.value) {
            startValue = instrument.getTime9();
            endValue = instrument.getTime12();
            sectionTime = time - HourValues.H9.value;
        } else if (time <= HourValues.H15.value) {
            startValue = instrument.getTime12();
            endValue = instrument.getTime15();
            sectionTime = time - HourValues.H12.value;
        } else if (time <= HourValues.H18.value) {
            startValue = instrument.getTime15();
            endValue = instrument.getTime18();
            sectionTime = time - HourValues.H15.value;
        } else if (time <= HourValues.H21.value) {
            startValue = instrument.getTime18();
            endValue = instrument.getTime21();
            sectionTime = time - HourValues.H18.value;
        } else {
            startValue = instrument.getTime21();
            endValue = instrument.getTime0();
            sectionTime = time - HourValues.H21.value;
        }

        step = (endValue - startValue) / HourValues.H3.value;

        return startValue + (step * sectionTime);
    }
}
