package com.pethome.dto;

import com.pethome.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String status;
    private String phone;
    private String address;
    private String avatar;
    private String createdAt;

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.status = user.getStatus().name();
        this.phone = user.getPhone();
        this.address = user.getAddress();
        this.avatar = user.getAvatar();
        this.createdAt = user.getCreatedAt().toString();
    }
}
