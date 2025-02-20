package com.dynatrace.easytrade.thirdpartyservice.models;

public record FeatureFlag(String id, Boolean enabled, String name, String description, Boolean isModifiable,
        String tag) {
}