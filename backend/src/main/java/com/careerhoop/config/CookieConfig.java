package com.careerhoop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CookieConfig {

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.cookie.max-age:604800}")
    private int cookieMaxAge; // Default 7 days in seconds

    public boolean isCookieSecure() {
        return cookieSecure;
    }

    public String getCookieSameSite() {
        return cookieSameSite;
    }

    public int getCookieMaxAge() {
        return cookieMaxAge;
    }
}

