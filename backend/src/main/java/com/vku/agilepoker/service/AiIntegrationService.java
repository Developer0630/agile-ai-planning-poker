package com.vku.agilepoker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.vku.agilepoker.dto.PokerDtos.*;
import com.vku.agilepoker.dto.PokerDtos.AiDiscussRequest;
import com.vku.agilepoker.dto.PokerDtos.AiDiscussResponse;
import com.vku.agilepoker.dto.PokerDtos.AiEstimateRequest;
import com.vku.agilepoker.dto.PokerDtos.AiEstimateResponse;

@Service
public class AiIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(AiIntegrationService.class);
    private final RestClient restClient;

    public AiIntegrationService(@Value("${ai.service.base-url}") String aiBaseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(aiBaseUrl)
                .build();
    }

    public AiEstimateResponse requestInitialEstimate(AiEstimateRequest request) {
        try {
            return restClient.post()
                    .uri("/api/v1/ai/estimate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiEstimateResponse.class);
        } catch (Exception e) {
            log.warn("AI Service chưa bật, dùng Mock AI Estimate: {}", e.getMessage());
            return new AiEstimateResponse(5,
                    "Dựa trên mô tả kỹ thuật và tiêu chí nghiệm thu, task này có độ phức tạp mức trung bình (5 điểm) do cần xử lý đồng bộ dữ liệu và kiểm tra các trường hợp biên.");
        }
    }

    public AiDiscussResponse requestDiscussionReply(AiDiscussRequest request) {
        try {
            return restClient.post()
                    .uri("/api/v1/ai/discuss")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiDiscussResponse.class);
        } catch (Exception e) {
            log.warn("AI Service chưa bật, dùng Mock AI Discuss: {}", e.getMessage());
            return new AiDiscussResponse(
                    "Mình đã ghi nhận lập luận của các bạn về rủi ro kỹ thuật và nỗ lực kiểm thử. Nếu giữ nguyên phạm vi hiện tại, mình điều chỉnh đề xuất sang mức 5 điểm để đảm bảo an toàn tiến độ.",
                    5);
        }
    }
}