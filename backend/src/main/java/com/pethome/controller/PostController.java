package com.pethome.controller;

import com.pethome.dto.CommentRequest;
import com.pethome.dto.LikeRequest;
import com.pethome.dto.PostRequest;
import com.pethome.dto.PostResponse;
import com.pethome.model.Post;
import com.pethome.model.User;
import com.pethome.repository.PostRepository;
import com.pethome.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;
    private final PostRepository postRepository;

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        requireRole("PET_OWNER", "ADMIN", "SERVICE", "SUPPLIER");
        log.info("getAllPosts for user: {}", getCurrentUsername());
        return ResponseEntity.ok(postService.getAllPostsResponse());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        requireRole("PET_OWNER", "ADMIN", "SERVICE", "SUPPLIER");
        log.info("getPostById for user: {}", getCurrentUsername());
        return ResponseEntity.ok(postService.getPostByIdResponse(id));
    }

    @PostMapping
    public ResponseEntity<PostResponse> publishPost(@RequestBody PostRequest request) {
        requireRole("PET_OWNER");
        log.info("Publish post for user: {}", getCurrentUsername());
        Post post = postService.publishPost(request);
        return ResponseEntity.ok(new PostResponse(post));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likePost(@PathVariable Long id, @RequestBody LikeRequest request) {
        requireRole("PET_OWNER", "SERVICE");
        log.info("likePost for user: {}", getCurrentUsername());
        request.setPostId(id);
        postService.likePost(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<Void> commentPost(@PathVariable Long id, @RequestBody CommentRequest request) {
        requireRole("PET_OWNER", "SERVICE");
        log.info("commentPost for user: {}", getCurrentUsername());
        postService.commentPost(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        requireRole("PET_OWNER");
        log.info("deletePost for user: {}", getCurrentUsername());
        Post post = postService.getPostById(id);
        User currentUser = getCurrentUser();
        if (!post.getUser().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("无权删除此动态");
        }
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    private void requireRole(String... allowedRoles) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("未登录");
        }
        Set<String> allowedRolesSet = Set.of(allowedRoles);
        boolean hasAllowedRole = auth.getAuthorities().stream()
                .map(grantedAuthority -> {
                    String authority = grantedAuthority.getAuthority();
                    // Extract role name from "ROLE_XYZ" format
                    if (authority != null && authority.startsWith("ROLE_")) {
                        return authority.substring(5);
                    }
                    return authority;
                })
                .anyMatch(allowedRolesSet::contains);
        if (!hasAllowedRole) {
            throw new RuntimeException("无权限");
        }
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "anonymous";
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        throw new RuntimeException("未登录");
    }
}
