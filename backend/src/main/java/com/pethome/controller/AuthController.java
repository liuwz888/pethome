package com.pethome.controller;

import com.pethome.dto.LoginRequest;
import com.pethome.dto.LoginResponse;
import com.pethome.dto.RegisterRequest;
import com.pethome.dto.UserProfileResponse;
import com.pethome.model.User;
import com.pethome.security.JwtTokenProvider;
import com.pethome.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        userService.registerUser(request);
        return ResponseEntity.ok().body(new ApiResponse("注册成功"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for username: {}, password: {}", request.getUsername(), request.getPassword());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            log.info("Authentication successful for user: {}", authentication.getName());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.createToken(authentication);

            return ResponseEntity.ok(new LoginResponse(token, "Bearer"));
        } catch (AuthenticationException e) {
            log.error("Authentication failed for username: {}", request.getUsername(), e);
            return ResponseEntity.status(401).body(new ApiResponse("用户名或密码错误"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok().body(null);
        }

        String username = authentication.getName();
        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isEmpty()) {
            return ResponseEntity.ok().body(null);
        }

        User user = userOptional.get();
        UserProfileResponse profile = new UserProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name(),
            user.getPhone(),
            user.getAddress(),
            user.getAvatar()
        );

        return ResponseEntity.ok(profile);
    }

    private record ApiResponse(String message) {}
}
