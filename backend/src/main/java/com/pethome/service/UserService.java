package com.pethome.service;

import com.pethome.dto.RegisterRequest;
import com.pethome.dto.UserResponse;
import com.pethome.dto.UserUpdateRequest;
import com.pethome.model.User;
import com.pethome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByUsername(email)
                .or(() -> userRepository.findByEmail(email));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        return new UserResponse(user);
    }

    @Transactional
    public void registerUser(RegisterRequest request) {
        Optional<User> existingUser = findByUsername(request.getUsername());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("用户名已存在: " + request.getUsername());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        String roleName = request.getRole() != null ? request.getRole() : "PET_OWNER";
        user.setRole(User.Role.valueOf(roleName));
        user.setStatus(User.Status.ACTIVE);
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());

        userRepository.save(user);
        log.info("注册用户成功: {}", request.getUsername());
    }

    @Transactional
    public void updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            user.setRole(User.Role.valueOf(request.getRole()));
        }
        if (request.getStatus() != null) {
            user.setStatus(User.Status.valueOf(request.getStatus()));
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        log.info("更新用户信息: {}", id);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("用户不存在: " + id);
        }
        userRepository.deleteById(id);
        log.info("删除用户: {}", id);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByStatus(User.Status status) {
        return userRepository.findByStatus(status).stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Optional<User> authenticate(String username, String rawPassword) {
        Optional<User> user = findByUsername(username);
        if (user.isPresent() && user.get().getStatus() == User.Status.ACTIVE) {
            if (passwordEncoder.matches(rawPassword, user.get().getPassword())) {
                return user;
            }
        }
        return Optional.empty();
    }
}
