package com.avgmax.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling 
@ComponentScan(basePackages = "com.avgmax")
public class AppConfig {

}