package com.pethome.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIContentAnalyzerService {

    private final RestTemplate restTemplate;
    @Value("${ai.claude.api-key:}")
    private String claudeApiKey;

    @Value("${ai.claude.model:claude-3-haiku-20240307}")
    private String model;

    private String endpoint;

    @PostConstruct
    void init() {
        this.endpoint = "https://api.anthropic.com/v1/messages";
    }

    public String analyzeSentiment(String text) {
        if (!StringUtils.hasText(text)) {
            return "NEUTRAL";
        }
        String prompt = "Analyze the sentiment of the following text and return ONLY one word: NEUTRAL, POSITIVE, NEGATIVE. Text: \"" + text + "\"";
        String response = callClaude(prompt);
        return response.trim();
    }

    public String analyzeContent(String text) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        String prompt = "Summarize the key topics in this text, list them as comma separated tags, max 5 tags: \"" + text + "\"";
        return callClaude(prompt);
    }

    public String generateCommentReply(String postContent, String commentContent) {
        if (!StringUtils.hasText(commentContent)) {
            return "";
        }
        String safePost = StringUtils.hasText(postContent) ? postContent : "(empty post)";
        String prompt = "You are a friendly assistant in a pet community app. " +
                "Write a short, helpful reply (max 50 words) to this user comment. " +
                "Post: \"" + safePost + "\" Comment: \"" + commentContent + "\"";
        return callClaude(prompt);
    }

    private String callClaude(String prompt) {
        if (!StringUtils.hasText(claudeApiKey)) {
            log.debug("Claude API key not configured; skipping AI request");
            return "";
        }
        try {
            String requestBody = """
                {
                  "model": "%s",
                  "messages": [
                    {
                      "role": "user",
                      "content": %s
                    }
                  ],
                  "max_tokens": 1024,
                  "temperature": 0.7
                }
                """.formatted(model, formatMessage(prompt));

            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, requestBody, String.class);
            String body = response.getBody();
            if (body == null) {
                return "";
            }
            // Extract content between quotes
            int start = body.indexOf('\"', body.indexOf("\"content\"")) + 1;
            int end = body.indexOf('\"', start);
            return (end > start) ? body.substring(start, end) : "";
        } catch (Exception e) {
            log.warn("AI analysis failed: {}", e.getMessage());
            return "";
        }
    }

    private String formatMessage(String message) {
        return "\"" + message.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }
}