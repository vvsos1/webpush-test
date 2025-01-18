package com.example.webpushtest;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class WebpushController {
    private final SubscriptionRepository repository;
    private final PushService pushService;
    private final ObjectMapper mapper;
    private final SubscriptionRepository subscriptionRepository;

    public WebpushController(SubscriptionRepository repository, PushService pushService, ObjectMapper mapper, SubscriptionRepository subscriptionRepository) {
        this.repository = repository;
        this.pushService = pushService;
        this.mapper = mapper;
        this.subscriptionRepository = subscriptionRepository;
    }

    public String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    // 클라이언트가 보낸 구독 정보를 저장
    @Transactional
    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(HttpServletRequest request, @RequestBody Subscription subscription) {
        log.debug("client ip: {}", getClientIP(request));
        SubscriptionEntity entity = SubscriptionEntity.from(subscription);
        entity.setIp(getClientIP(request));
        entity.setUserAgent(request.getHeader("User-Agent"));
        log.debug("subscription: {}", entity);
        subscriptionRepository.save(entity);
        return ResponseEntity.noContent().build();
    }

    // 저장된 구독 정보를 사용하여 푸시 메시지를 전송
    @Transactional
    @PostMapping("/push")
    public ResponseEntity<Void> push(@RequestBody Payload payload) {
        log.debug("payload: {}", payload);
        for (SubscriptionEntity subscription : repository.findAll()) {
            try {
                log.debug("notification send to subscription: {} with paylod {}", subscription, payload);
                Notification notification = new Notification(
                        subscription.toSubscription(),
                        mapper.writeValueAsString(payload)
                );
                pushService.send(notification);
            } catch (Exception e) {
                log.debug("error: {}", e.getMessage());
                subscriptionRepository.delete(subscription);
                log.debug("subscription deleted: {}", subscription);
            }
        }
        return ResponseEntity.noContent().build();
    }

    record Payload(String title, String body) {
    }
}
