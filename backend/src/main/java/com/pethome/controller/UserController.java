package com.pethome.controller;

import com.pethome.dto.UserResponse;
import com.pethome.dto.UserUpdateRequest;
import com.pethome.model.User;
import com.pethome.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        userService.updateUser(id, request);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(User.Role.valueOf(role)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<UserResponse>> getUsersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(userService.getUsersByStatus(User.Status.valueOf(status)));
    }
}
