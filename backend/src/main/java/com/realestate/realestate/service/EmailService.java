
package com.realestate.realestate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends a simple text email.
     * @param to The recipient's email address.
     * @param subject The subject of the email.
     * @param body The body content of the email.
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("propmanage.noreply@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            System.out.println("[SMTP SUCCESS] Email sent to: " + to);
        } catch (Exception e) {
            System.out.println("--------------------------------------------------");
            System.out.println("[EMAIL LOG (MOCK)] To: " + to);
            System.out.println("[EMAIL LOG (MOCK)] Subject: " + subject);
            System.out.println("[EMAIL LOG (MOCK)] Body: " + body);
            System.out.println("[INFO] SMTP details not configured, email printed to console.");
            System.out.println("--------------------------------------------------");
        }
    }
}
