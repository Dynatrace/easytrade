package com.dynatrace.easytrade.creditcardorderservice.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// feature-flag-service adds fields (e.g. enabledAt) while a flag is enabled; ignore the ones we don't use
@JsonIgnoreProperties(ignoreUnknown = true)
public record FeatureFlag(String id, Boolean enabled, String name, String description, Boolean isModifiable,
                          String tag) {
}
