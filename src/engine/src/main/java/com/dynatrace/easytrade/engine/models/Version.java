package com.dynatrace.easytrade.engine.models;

import java.util.Optional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class Version {

    private String buildVersion;
    private String buildDate;
    private String buildCommit;

    public String toString() {
        return String.format("EasyTrade Engine Version: %s\n\nBuild date: %s, git commit: %s", buildVersion, buildDate, buildCommit);
    }

    public Optional<String> toJson() {
        var jsonWriter = new ObjectMapper().writer().withDefaultPrettyPrinter();
        try {
            return Optional.ofNullable(jsonWriter.writeValueAsString(this));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

}
