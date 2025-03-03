package com.dynatrace.easytrade.accountservice;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
@RequestMapping("/account")
@CrossOrigin
public class AccountController {
    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);
    private final HttpClient httpClient = HttpClient.newBuilder().build();
    private final Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'hh:mm:ss").create();
    private final String manager = System.getenv("MANAGER_HOSTANDPORT");

    @GetMapping("/{accountId}")
    public Account get(@PathVariable int accountId) throws IOException, InterruptedException {
        logger.info("Getting account data for {}", accountId);

        // file deepcode ignore Ssrf: trusted environment variable
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(String.format("http://%s/api/Accounts/GetAccountById/%d", manager, accountId)))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        Account account = gson.fromJson(response.body(), Account.class);

        return account;
    }

    @PutMapping(value = "/update", produces = "text/plain")
    public ResponseEntity<String> put(@RequestBody Account accountDetails) throws IOException, InterruptedException {
        logger.info("Updating account data with body: {}", gson.toJson(accountDetails));

        // file deepcode ignore Ssrf: trusted environment variable
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(String.format("http://%s/api/Accounts/ModifyAccount", manager)))
                .PUT(HttpRequest.BodyPublishers.ofString(gson.toJson(accountDetails)))
                .header("Content-Type", "application/json")
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        return new ResponseEntity<>(response.body(), HttpStatus.valueOf(response.statusCode()));
    }
}
