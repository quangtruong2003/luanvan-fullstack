package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {
    
    private final EmailService emailService;
    
    @PostMapping("/send-test-email")
    public ResponseEntity<String> sendTestEmail(@RequestParam String email) {
        try {
            System.out.println("🧪 TestController: Bắt đầu test email");
            System.out.println("🧪 Email: " + email);
            
            emailService.sendSimpleEmail(
                email,
                "Test Email - Hệ thống đặt lịch khám bệnh",
                "Đây là email test để kiểm tra cấu hình email. Nếu bạn nhận được email này, hệ thống email đã hoạt động bình thường."
            );
            
            System.out.println("✅ Test email đã gửi thành công");
            return ResponseEntity.ok("Email test đã được gửi thành công đến: " + email);
        } catch (Exception e) {
            System.err.println("❌ Lỗi test email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi gửi email: " + e.getMessage());
        }
    }
    
    @PostMapping("/send-test-html-email")
    public ResponseEntity<String> sendTestHtmlEmail(@RequestParam String email) {
        try {
            System.out.println("🧪 TestController: Bắt đầu test HTML email");
            System.out.println("🧪 Email: " + email);
            
            String htmlContent = "<html><body>" +
                "<h2>Test HTML Email</h2>" +
                "<p>Đây là email test HTML để kiểm tra cấu hình email.</p>" +
                "<p>Nếu bạn nhận được email này, hệ thống email đã hoạt động bình thường.</p>" +
                "<p>Thời gian: " + java.time.LocalDateTime.now() + "</p>" +
                "</body></html>";
            
            emailService.sendHtmlEmail(
                email,
                "Test HTML Email - Hệ thống đặt lịch khám bệnh",
                htmlContent
            );
            
            System.out.println("✅ Test HTML email đã gửi thành công");
            return ResponseEntity.ok("HTML email test đã được gửi thành công đến: " + email);
        } catch (Exception e) {
            System.err.println("❌ Lỗi test HTML email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi gửi HTML email: " + e.getMessage());
        }
    }
    
    // Thêm endpoint mới để test với JSON body
    @PostMapping("/send-simple-email")
    public ResponseEntity<String> sendSimpleEmailWithJson(@RequestBody EmailTestRequest request) {
        try {
            System.out.println("🧪 TestController: Bắt đầu test email với JSON");
            System.out.println("🧪 Email: " + request.getTo());
            System.out.println("🧪 Subject: " + request.getSubject());
            System.out.println("🧪 Text: " + request.getText());
            
            emailService.sendSimpleEmail(
                request.getTo(),
                request.getSubject(),
                request.getText()
            );
            
            System.out.println("✅ Test email JSON đã gửi thành công");
            return ResponseEntity.ok("Email test đã được gửi thành công đến: " + request.getTo());
        } catch (Exception e) {
            System.err.println("❌ Lỗi test email JSON: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi gửi email: " + e.getMessage());
        }
    }
    
    @PostMapping("/send-html-email")
    public ResponseEntity<String> sendHtmlEmailWithJson(@RequestBody EmailHtmlTestRequest request) {
        try {
            System.out.println("🧪 TestController: Bắt đầu test HTML email với JSON");
            System.out.println("🧪 Email: " + request.getTo());
            System.out.println("🧪 Subject: " + request.getSubject());
            
            emailService.sendHtmlEmail(
                request.getTo(),
                request.getSubject(),
                request.getHtmlContent()
            );
            
            System.out.println("✅ Test HTML email JSON đã gửi thành công");
            return ResponseEntity.ok("HTML email test đã được gửi thành công đến: " + request.getTo());
        } catch (Exception e) {
            System.err.println("❌ Lỗi test HTML email JSON: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi gửi HTML email: " + e.getMessage());
        }
    }
    
    // Inner classes cho request
    public static class EmailTestRequest {
        private String to;
        private String subject;
        private String text;
        
        // Getters and Setters
        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }
    
    public static class EmailHtmlTestRequest {
        private String to;
        private String subject;
        private String htmlContent;
        
        // Getters and Setters
        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getHtmlContent() { return htmlContent; }
        public void setHtmlContent(String htmlContent) { this.htmlContent = htmlContent; }
    }
} 