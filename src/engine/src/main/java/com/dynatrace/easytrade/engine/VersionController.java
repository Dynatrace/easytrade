package com.dynatrace.easytrade.engine;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dynatrace.easytrade.engine.models.Version;

import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/version")
public class VersionController {

    private Version version;

    public VersionController(
            @Value("${build.version}") String buildVersion, 
            @Value("${build.date}") String buildDate, 
            @Value("${build.commit}") String buildCommit) {
        version = new Version(buildVersion, buildDate, buildCommit);
    }

    @GetMapping(produces = { "text/plain", "application/json" })
    public ResponseEntity<String> getVersion(@Parameter(hidden = true) @RequestHeader(HttpHeaders.ACCEPT) String accept) {
        switch(accept) {
            case "application/json":
                return version.toJson().map(ResponseEntity::ok)
                        .orElse(ResponseEntity.internalServerError().body("{\"Message\":\"Failed to serialize JSON\"}"));
            default:
                return ResponseEntity.ok().body(version.toString());
        }
    }

}
