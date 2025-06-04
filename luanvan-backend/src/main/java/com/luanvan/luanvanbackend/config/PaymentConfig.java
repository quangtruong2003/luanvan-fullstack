package com.luanvan.luanvanbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "payment")
@Data
public class PaymentConfig {
    
    private Momo momo = new Momo();
    private Vnpay vnpay = new Vnpay();
    private Common common = new Common();
    
    @Data
    public static class Momo {
        private String partnerCode;
        private String accessKey;
        private String secretKey;
        private String publicKey;
        private String endpoint = "https://test-payment.momo.vn";
        private String createOrderUrl = "/v2/gateway/api/create";
        private String queryStatusUrl = "/v2/gateway/api/query";
        private String returnUrl;
        private String notifyUrl;
        private boolean sandbox = true;
        private int timeout = 30000; // 30 seconds
        
        // Deep link configuration
        private String iosScheme = "momo://"; 
        private String androidScheme = "momo://";
        private String webUrl = "https://payment.momo.vn";
    }
    
    @Data
    public static class Vnpay {
        private String tmnCode;
        private String hashSecret;
        private String endpoint = "https://sandbox.vnpayment.vn";
        private String payUrl = "/paymentv2/vpcpay.html";
        private String queryUrl = "/merchant_webapi/api/transaction";
        private String returnUrl;
        private String notifyUrl;
        private boolean sandbox = true;
        private String version = "2.1.0";
        private String command = "pay";
        private String orderType = "other";
        private String locale = "vn";
        private String currCode = "VND";
        private int timeout = 30000; // 30 seconds
        
        // Deep link configuration
        private String iosScheme = "vnpay://";
        private String androidScheme = "vnpay://";
        private String webUrl = "https://pay.vnpay.vn";
    }
    
    @Data
    public static class Common {
        private int paymentTimeout = 15; // 15 minutes
        private int maxRetryAttempts = 3;
        private String defaultCurrency = "VND";
        private String baseUrl = "http://localhost:8080";
        private String successRedirectPath = "/payment/success";
        private String failureRedirectPath = "/payment/failure";
        private String cancelRedirectPath = "/payment/cancel";
        private String callbackPath = "/api/payments/callback";
        
        // Mobile app configuration
        private boolean enableDeepLink = true;
        private String mobileSuccessScheme = "luanvan://payment/success";
        private String mobileFailureScheme = "luanvan://payment/failure"; 
        private String mobileCancelScheme = "luanvan://payment/cancel";
    }
} 