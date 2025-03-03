package com.dynatrace.easytrade.featureflagservice;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@CrossOrigin
@RequestMapping("/v1/flags")
@OpenAPIDefinition(info = @Info(title = "Feature flags API"))
public class FlagController {
	private static final Logger logger = LoggerFactory.getLogger(FlagController.class);
	private final Gson gson = new Gson();
	private final FlagService flagService;

	@Autowired
	public FlagController(FlagService flagService) {
		this.flagService = flagService;
	}

	@Operation(summary = "Get a flag by id")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Flag found", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = Flag.class))
			}),
			@ApiResponse(responseCode = "404", description = "Not found - check if the id is valid", content = @Content)
	})
	@GetMapping("/{flagId}")
	public ResponseEntity<Flag> getFlagById(@PathVariable String flagId) {
		logger.info("Getting flag data for id {}", flagId);
		Optional<Flag> flag = flagService.getFlagById(flagId);

		return flag.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@Operation(summary = "Enable or disable flag")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Flag updated", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = Flag.class))
			}),
			@ApiResponse(responseCode = "400", description = "Bad request - check if the flag is modifiable", content = @Content),
			@ApiResponse(responseCode = "404", description = "Not found - check if the id is valid", content = @Content)
	})
	@PutMapping(value = "/{flagId}", produces = "application/json")
	public ResponseEntity<String> updateFlag(@PathVariable String flagId, @RequestBody FlagUpdateRequest enabled) {
		logger.info("Updating value of flag {} with {}", flagId, enabled.enabled());

		try {
			Optional<Flag> flag = flagService.updateFlag(flagId, enabled.enabled());
			return flag.map(f -> ResponseEntity.ok(gson.toJson(f))).orElseGet(() -> ResponseEntity.notFound().build());
		} catch (Exception e) {
			return ResponseEntity.badRequest()
					.body(String.format("{\"message\": \"%s\"}", e.getMessage()));
		}
	}

	@Operation(summary = "Get all flags with the defined tag")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "List of found flags", content = {
					@Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Flag.class)))
			})
	})
	@GetMapping()
	public ResponseEntity<FlagContainer> getFlags(@RequestParam Optional<String> tag) {
		if (tag.isPresent()) {
			logger.info("Getting flags with tag {}", tag.get());
			return ResponseEntity.ok(new FlagContainer(flagService.getFlagsByTag(tag.get())));
		}
		logger.info("Getting all flags");
		return ResponseEntity.ok(new FlagContainer(flagService.getAllFlags()));
	}
}
