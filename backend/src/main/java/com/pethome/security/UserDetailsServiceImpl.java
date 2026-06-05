package com.pethome.security;

import com.pethome.model.User;
import com.pethome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.debug("User not found: {}", username);
                    return new UsernameNotFoundException("用户不存在: " + username);
                });

        log.debug("User found: id={}, username={}, status={}, password={}",
                user.getId(), user.getUsername(), user.getStatus(),
                user.getPassword() != null ? "present" : "null");

        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getStatus() == User.Status.ACTIVE,
                true, true, true,
                authorities
        );

        log.debug("UserDetails created for: {}", username);
        return userDetails;
    }
}
