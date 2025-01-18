package com.example.webpushtest;

import jakarta.persistence.*;
import lombok.*;
import nl.martijndwars.webpush.Subscription;

@ToString()
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class SubscriptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column
    private String endpoint;


    @Embedded
    private Keys keys;
    @Column
    private String ip;
    @Column
    private String userAgent;

    public SubscriptionEntity(String endpoint, Keys keys) {
        this.endpoint = endpoint;
        this.keys = keys;
    }

    public static SubscriptionEntity from(Subscription subscription) {
        return new SubscriptionEntity(subscription.endpoint, new Keys(subscription.keys.p256dh, subscription.keys.auth));
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public Subscription toSubscription() {
        return new Subscription(endpoint, new Subscription.Keys(keys.p256dh, keys.auth));
    }

    @ToString
    @AllArgsConstructor
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Embeddable
    static class Keys {
        private String p256dh;
        private String auth;
    }

}
