package com.example.gateway.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final ReactiveAuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Autowired
    public AuthController(ReactiveAuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<Object>> login(@RequestBody LoginRequest request) {
        return authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(
                        request.username(), request.password()))
                .map(auth -> {
                    List<String> roles = auth.getAuthorities().stream()
                            .map(granted -> granted.getAuthority())
                            .toList();
                    String token = jwtService.generarToken(auth.getName(), roles);
                    return ResponseEntity.ok().body((Object) new LoginResponse(token, auth.getName(), roles));
                })
                .onErrorResume(error ->
                        Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body((Object) Map.of("error", "Credenciales invalidas"))));
    }

    public record LoginRequest(String username, String password) {
    }

    public record LoginResponse(String token, String username, List<String> roles) {
    }
}