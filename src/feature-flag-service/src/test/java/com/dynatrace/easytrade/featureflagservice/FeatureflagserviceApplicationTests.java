package com.dynatrace.easytrade.featureflagservice;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@WebMvcTest(FlagController.class)
@ExtendWith(MockitoExtension.class)
class FeatureflagserviceApplicationTests {

	@SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private FlagController flagController;

	private FlagService flagService;

	private final Map<String, Flag> mockFlags = new HashMap<>(
			Map.of("FLAG_1", new Flag("FLAG_1", true, "TEST FLAG 1", "This is a test flag 1", true, "config"),
					"FLAG_2",
					new Flag("FLAG_2", false, "TEST FLAG 2", "This is a test flag 2", true, "problem_pattern"),
					"FLAG_3", new Flag("FLAG_3", true, "TEST FLAG 3", "This is a test flag 3", false, "config")));

	@BeforeEach
	void setUp() {
		flagService = new FlagService(mockFlags);
		flagController = new FlagController(flagService);
		this.mockMvc = MockMvcBuilders.standaloneSetup(flagController).build();

	}

	@Test
	void shouldGetAllFlags() throws Exception {
		flagService = new FlagService(mockFlags);
		flagController = new FlagController(flagService);
		MvcResult mvcResult = this.mockMvc.perform(MockMvcRequestBuilders.get("/v1/flags"))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();

		assertEquals(
				"{\"results\":[{\"id\":\"FLAG_3\",\"enabled\":true,\"name\":\"TEST FLAG 3\",\"description\":\"This is a test flag 3\",\"isModifiable\":false,\"tag\":\"config\"},{\"id\":\"FLAG_1\",\"enabled\":true,\"name\":\"TEST FLAG 1\",\"description\":\"This is a test flag 1\",\"isModifiable\":true,\"tag\":\"config\"},{\"id\":\"FLAG_2\",\"enabled\":false,\"name\":\"TEST FLAG 2\",\"description\":\"This is a test flag 2\",\"isModifiable\":true,\"tag\":\"problem_pattern\"}]}",
				mvcResult.getResponse().getContentAsString());
	}

	@Test
	void shouldGetFlagsByTag() throws Exception {
		MvcResult mvcResult = this.mockMvc.perform(MockMvcRequestBuilders.get("/v1/flags").param("tag", "config"))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();

		assertEquals(
				"{\"results\":[{\"id\":\"FLAG_3\",\"enabled\":true,\"name\":\"TEST FLAG 3\",\"description\":\"This is a test flag 3\",\"isModifiable\":false,\"tag\":\"config\"},{\"id\":\"FLAG_1\",\"enabled\":true,\"name\":\"TEST FLAG 1\",\"description\":\"This is a test flag 1\",\"isModifiable\":true,\"tag\":\"config\"}]}",
				mvcResult.getResponse().getContentAsString());
	}

	@Test
	void shouldGetEmptyListForNonExistentTag() throws Exception {
		MvcResult mvcResult = this.mockMvc.perform(MockMvcRequestBuilders.get("/v1/flags").param("tag", "some_tag"))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();

		assertEquals(
				"{\"results\":[]}", mvcResult.getResponse().getContentAsString());
	}

	@Test
	void shouldGetFlagById() throws Exception {
		MvcResult mvcResult = this.mockMvc.perform(MockMvcRequestBuilders.get("/v1/flags/FLAG_2"))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();

		assertEquals(
				"{\"id\":\"FLAG_2\",\"enabled\":false,\"name\":\"TEST FLAG 2\",\"description\":\"This is a test flag 2\",\"isModifiable\":true,\"tag\":\"problem_pattern\"}",
				mvcResult.getResponse().getContentAsString());
	}

	@Test
	void shouldGetNotFoundForGetWithInvalidId() throws Exception {
		this.mockMvc.perform(MockMvcRequestBuilders.get("/v1/flags/flag"))
				.andExpect(MockMvcResultMatchers.status().isNotFound())
				.andReturn();

	}

	@Test
	void shouldUpdateFlag() throws Exception {
		MvcResult mvcResult = this.mockMvc.perform(
				MockMvcRequestBuilders.put("/v1/flags/FLAG_1").contentType(MediaType.APPLICATION_JSON)
						.content("{\"enabled\": false}"))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andReturn();

		assertEquals(
				"{\"id\":\"FLAG_1\",\"enabled\":false,\"name\":\"TEST FLAG 1\",\"description\":\"This is a test flag 1\",\"isModifiable\":true,\"tag\":\"config\"}",
				mvcResult.getResponse().getContentAsString());
	}

	@Test
	void shouldNotUpdateNonModifiableFlag() throws Exception {
		this.mockMvc.perform(
				MockMvcRequestBuilders.put("/v1/flags/FLAG_3").contentType(MediaType.APPLICATION_JSON)
						.content("{\"enabled\": false}"))
				.andExpect(MockMvcResultMatchers.status().isBadRequest());
	}

	@Test
	void shouldGetNotFoundForUpdateWithInvalidId() throws Exception {
		this.mockMvc.perform(
				MockMvcRequestBuilders.put("/v1/flags/flag").contentType(MediaType.APPLICATION_JSON)
						.content("{\"enabled\": false}"))
				.andExpect(MockMvcResultMatchers.status().isNotFound())
				.andReturn();
	}

}
