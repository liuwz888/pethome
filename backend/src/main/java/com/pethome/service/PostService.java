package com.pethome.service;

import com.pethome.dto.CommentRequest;
import com.pethome.dto.CommentResponse;
import com.pethome.dto.LikeRequest;
import com.pethome.dto.PostRequest;
import com.pethome.dto.PostResponse;
import com.pethome.model.Comment;
import com.pethome.model.Like;
import com.pethome.model.Post;
import com.pethome.model.User;
import com.pethome.repository.CommentRepository;
import com.pethome.repository.LikeRepository;
import com.pethome.repository.PostRepository;
import com.pethome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 社交动态服务层
 * 负责动态的发布、点赞、评论等业务逻辑
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    /**
     * 发布新动态
     * @param request 包含用户ID和动态内容
     * @return 保存后的Post实体
     */
    @Transactional
    public Post publishPost(PostRequest request) {
        // 从认证上下文获取当前用户
        User user = getCurrentUser();
        log.info("当前用户: {} (ID: {})", user.getUsername(), user.getId());

        // 2. 构建Post实体
        Post post = new Post();
        post.setUser(user);
        post.setContent(request.getContent());
        post.setCreatedAt(java.time.LocalDateTime.now());
        post.setUpdatedAt(java.time.LocalDateTime.now());

        log.info("准备保存Post，Post内容: {}, User ID: {}", post.getContent(), post.getUser().getId());

        // 3. 保存到数据库
        Post saved = postRepository.save(post);
        log.info("Post保存成功: {}", saved.getId());
        return saved;
    }

    /**
     * 点赞动态
     * @param request 包含用户ID和动态ID
     */
    @Transactional
    public void likePost(LikeRequest request) {
        // 从认证上下文获取当前用户
        User user = getCurrentUser();
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("动态不存在"));

        // 2. 防重复点赞：检查是否已存在点赞记录
        Like existing = likeRepository.findByUserIdAndPostId(user.getId(), post.getId());
        if (existing != null) {
            return; // 已点赞，直接返回
        }

        // 3. 创建点赞记录
        Like like = new Like();
        like.setUser(user);
        like.setPost(post);
        likeRepository.save(like);
    }

    /**
     * 评论动态
     * @param postId 动态ID
     * @param request 评论内容
     */
    @Transactional
    public void commentPost(Long postId, CommentRequest request) {
        // 从认证上下文获取当前用户
        User user = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("动态不存在"));

        // 2. 构建评论实体
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(request.getContent());
        comment.setCreatedAt(java.time.LocalDateTime.now());
        commentRepository.save(comment);
    }

    /**
     * 获取所有动态列表（按时间倒序）
     * @return 动态列表
     */
    @Transactional(readOnly = true)
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    /**
     * 获取所有动态响应列表（按时间倒序）
     * @return 动态响应列表
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPostsResponse() {
        return postRepository.findAll().stream()
                .map(PostResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户发布的所有动态
     * @param userId 用户ID
     * @return 动态列表
     */
    @Transactional(readOnly = true)
    public List<Post> getPostsByUser(Long userId) {
        return postRepository.findAll().stream()
                .filter(post -> post.getUser() != null && post.getUser().getId().equals(userId))
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取单条动态
     * @param id 动态ID
     * @return Post实体
     * @throws RuntimeException 如果动态不存在
     */
    @Transactional(readOnly = true)
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("动态不存在"));
    }

    /**
     * 根据ID获取单条动态响应
     * @param id 动态ID
     * @return PostResponse
     * @throws RuntimeException 如果动态不存在
     */
    @Transactional(readOnly = true)
    public PostResponse getPostByIdResponse(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("动态不存在: " + id));
        PostResponse response = new PostResponse(post);

        // 获取评论列表
        List<CommentResponse> commentResponses = commentRepository.findByPostId(id).stream()
                .map(CommentResponse::new)
                .collect(Collectors.toList());
        response.setComments(commentResponses);

        return response;
    }

    /**
     * 获取当前认证用户
     */
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            Object principal = auth.getPrincipal();
            if (principal instanceof User user) {
                return user;
            }
            if (principal instanceof org.springframework.security.core.userdetails.User springUser) {
                // 从数据库获取完整的 User 对象
                return userRepository.findByUsername(springUser.getUsername())
                        .orElseThrow(() -> new RuntimeException("用户不存在: " + springUser.getUsername()));
            }
        }
        throw new RuntimeException("未登录");
    }
}
