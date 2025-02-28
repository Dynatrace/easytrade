package com.dynatrace.easytrade.featureflagservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;

import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/version")
public class VersionController {
    private static final Gson gson = new Gson();

    private Version version;

    public VersionController(
            @Value("${build.version}") String buildVersion,
            @Value("${build.date}") String buildDate,
            @Value("${build.commit}") String buildCommit) {
        version = new Version(buildVersion, buildDate, buildCommit);
    }

    @GetMapping(produces = { "text/plain", "application/json" })
    public ResponseEntity<String> getVersion(
            @Parameter(hidden = true) @RequestHeader(HttpHeaders.ACCEPT) String accept) {
        switch (accept) {
            case "application/json":
                return ResponseEntity.ok(gson.toJson(version));
            default:
                return ResponseEntity.ok(version.toString());
        }
    }
}
