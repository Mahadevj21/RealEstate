package com.realestate.realestate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.realestate.realestate")
public class RealestateApplication {

    public static void main(String[] args) {
        SpringApplication.run(RealestateApplication.class, args);
    }
}
