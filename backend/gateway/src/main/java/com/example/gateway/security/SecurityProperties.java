package com.example.gateway.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private Map<String, UserInfo> users = new LinkedHashMap<>();

    public Map<String, UserInfo> getUsers() {
        return users;
    }

    public void setUsers(Map<String, UserInfo> users) {
        this.users = users;
    }

    public static class UserInfo {
        private String password;
        private List<String> roles = new ArrayList<>();

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public List<String> getRoles() {
            return roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }
    }
}