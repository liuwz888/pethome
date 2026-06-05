package com.pethome.security;

import com.pethome.model.User;
import com.pethome.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);
        log.debug("JWT Filter - Token: {}", token != null ? token.substring(0, Math.min(50, token.length())) + "..." : "null");

        if (StringUtils.hasText(token)) {
            boolean isValid = tokenProvider.validateToken(token);
            log.debug("JWT Filter - Token valid: {}", isValid);

            if (isValid) {
                String username = tokenProvider.getUsernameFromToken(token);
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("用户不存在: " + username));

                List<String> roles = tokenProvider.getRolesFromToken(token);
                // 确保角色格式为 "ROLE_XYZ"
                List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> {
                            if (role != null && !role.startsWith("ROLE_")) {
                                return new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role);
                            }
                            return new org.springframework.security.core.authority.SimpleGrantedAuthority(role);
                        })
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, token, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("JWT Filter - Authentication set for user: {}, authorities: {}", authentication.getPrincipal(), authentication.getAuthorities());
            }
        }
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
