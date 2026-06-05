package com.pethome.task;

import com.pethome.model.InteractionLog;
import com.pethome.service.AIContentAnalyzerService;
import com.pethome.service.InteractionLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AIInteractionAnalysisTask {

    private final InteractionLogService interactionLogService;
    private final AIContentAnalyzerService aiContentAnalyzerService;

    // 每 5 分钟执行一次
    @Scheduled(cron = "0 */5 * * * *")
    public void analyzeInteractions() {
        log.info("开始批量分析点赞/评论情感...");

        // 获取所有交互记录（实际项目应加入 analyzed 标记避免重复）
        List<InteractionLog> logs = interactionLogService.findAll();

        for (InteractionLog interaction : logs) {
            String sentiment = aiContentAnalyzerService.analyzeSentiment(
                    "用户" + interaction.getType() + "了动态");
            log.info("交互ID: {}, 情感分析: {}", interaction.getId(), sentiment);
        }

        log.info("批量分析完成");
    }
}
