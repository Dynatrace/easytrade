package com.dynatrace.easytrade.featureflagservice;

public record Version(String buildVersion, String buildDate, String buildCommit) {

    public String toString() {
        return String.format("EasyTrade Feature Flag Service Version: %s\n\nBuild date: %s, git commit: %s",
                buildVersion, buildDate, buildCommit);
    }
}
