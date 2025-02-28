package com.dynatrace.easytrade.featureflagservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.web.servlet.ConditionalOnMissingFilterBean;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.web.filter.ForwardedHeaderFilter;

import jakarta.servlet.DispatcherType;

@SpringBootApplication
public class FeatureflagserviceApplication {
	private static final Logger logger = LoggerFactory.getLogger(FeatureflagserviceApplication.class);

	public static void main(String[] args) {
		logger.info("Running Feature Flag Service application");
		SpringApplication.run(FeatureflagserviceApplication.class, args);
	}

	@Bean
	@ConditionalOnMissingFilterBean(ForwardedHeaderFilter.class)
	@ConditionalOnProperty(value = "server.forward-headers-strategy", havingValue = "framework")
	public FilterRegistrationBean<ForwardedHeaderFilter> forwardedHeaderFilter() {
		ForwardedHeaderFilter filter = new ForwardedHeaderFilter();
		FilterRegistrationBean<ForwardedHeaderFilter> registration = new FilterRegistrationBean<>(filter);
		registration.setDispatcherTypes(DispatcherType.REQUEST, DispatcherType.ASYNC, DispatcherType.ERROR);
		registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
		return registration;
	}
}
