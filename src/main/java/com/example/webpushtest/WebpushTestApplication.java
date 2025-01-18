package com.example.webpushtest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan
@SpringBootApplication
public class WebpushTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebpushTestApplication.class, args);
    }

}
