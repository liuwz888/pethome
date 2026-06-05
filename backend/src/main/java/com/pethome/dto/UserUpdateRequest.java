package com.pethome.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    private String email;
    private String role;
    private String status;
    private String phone;
    private String address;
    private String avatar;
}
