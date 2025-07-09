package com.avgmax.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 특정 origin을 명시적으로 허용 (credentials와 함께 사용할 때 필수)
        config.setAllowedOrigins(Arrays.asList("http://localhost:3001", "http://localhost:3000"));
        
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // Credentials 허용 (쿠키, 세션 등)
        config.setAllowCredentials(true);
        
        // 노출할 헤더 설정
        config.addExposedHeader("Access-Control-Allow-Credentials");
        config.addExposedHeader("Set-Cookie");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}