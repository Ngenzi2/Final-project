package com.examgov.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public MailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendStudentVerificationOtp(String toEmail, String studentName, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your ExamGov verification code");
        message.setText(
                "Hello " + studentName + ",\n\n"
                        + "Your driving company has approved your student registration on ExamGov.\n"
                        + "Enter this one-time code on the \"Verify email\" screen using your registered email ("
                        + toEmail
                        + ") to activate your account:\n\n"
                        + "    " + otp + "\n\n"
                        + "This code expires in 30 minutes. If you did not expect this email, you can ignore it.\n\n"
                        + "ExamGov - Driving Exam Governance");
        mailSender.send(message);
    }
}
