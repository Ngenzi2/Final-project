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
        String title = "Login Verification Code";
        String mainHeading = "Your Verification Code";
        String description = "Hello " + studentName + ",<br><br>Use this code to complete your login on ExamGov:";
        String codeBox = "<div style=\"border: 2px dashed #3a4b6c; border-radius: 12px; background-color: #111214; padding: 24px; text-align: center; margin: 30px 0;\">"
                + "<div style=\"font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #d4d8ff;\">"
                + otp + "</div>"
                + "</div>";
        String footer = "This code will expire in 10 minutes.<br>If you did not expect this email, you can safely ignore it.";

        sendHtmlEmail(toEmail, "Your ExamGov verification code", title, mainHeading, description, codeBox, footer);
    }

    public void sendPasswordResetOtp(String toEmail, String userName, String otpCode) {
        String title = "Password Reset Code";
        String mainHeading = "Your Reset Code";
        String description = "Hello " + userName
                + ",<br><br>We received a request to reset your password for ExamGov. Use this code to proceed:";
        String codeBox = "<div style=\"border: 2px dashed #3a4b6c; border-radius: 12px; background-color: #111214; padding: 24px; text-align: center; margin: 30px 0;\">"
                + "<div style=\"font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #d4d8ff;\">"
                + otpCode + "</div>"
                + "</div>";
        String footer = "This code will expire in 15 minutes.<br>If you didn't request a password reset, you can safely ignore this email.";

        sendHtmlEmail(toEmail, "ExamGov Password Reset", title, mainHeading, description, codeBox, footer);
    }

    public void sendOfficerCredentials(String toEmail, String officerName, String temporaryPassword) {
        String title = "Officer Account Access";
        String mainHeading = "Your new account";
        String description = "Hello " + officerName
                + ",<br><br>An Exam Officer account has been created for you. Use the temporary password below to sign in for the first time.";
        String codeBox = "<div style=\"border: 2px dashed #3a4b6c; border-radius: 12px; background-color: #111214; padding: 24px; text-align: center; margin: 30px 0;\">"
                + "<div style=\"font-size: 14px; color: #8892b0; margin-bottom: 8px; letter-spacing: normal;\">TEMPORARY PASSWORD</div>"
                + "<div style=\"font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #d4d8ff;\">"
                + temporaryPassword + "</div>"
                + "</div>";
        String footer = "Please log in and change your password as soon as possible.";

        sendHtmlEmail(toEmail, "Your ExamGov Exam Officer account", title, mainHeading, description, codeBox, footer);
    }

    public void sendPaymentQrCode(
            String toEmail, String studentName, String qrCodeValue, String examDetails, byte[] qrPngBytes) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Your ExamGov exam ticket - payment confirmed");

            String html = "<!DOCTYPE html>"
                    + "<html><head><meta charset=\"UTF-8\"></head>"
                    + "<body style=\"margin: 0; padding: 40px 20px; background-color: #151618; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\">"
                    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 600px; margin: 0 auto; background-color: #1e1e21; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);\">"
                    + "<tr><td style=\"background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 45px 30px; text-align: center;\">"
                    + "<h1 style=\"margin: 0 0 15px 0; color: #ffffff; font-size: 28px; font-weight: 700;\">Payment Confirmed</h1>"
                    + "<p style=\"margin: 0; color: #d1fae5; font-size: 15px; font-weight: 500;\">Your examination QR ticket is ready</p>"
                    + "</td></tr>"
                    + "<tr><td style=\"padding: 45px 30px;\">"
                    + "<p style=\"margin: 0 0 10px 0; color: #e2e8f0; font-size: 15px; line-height: 1.6;\">Hello " + studentName
                    + ",<br><br>Your examination fee payment was successful. " + (examDetails != null ? examDetails : "")
                    + " Present the QR code below to the exam officer on the day of your examination.</p>"
                    + "<div style=\"text-align: center; margin: 30px 0;\">"
                    + "<img src=\"cid:qrCodeImage\" alt=\"QR ticket\" width=\"220\" height=\"220\" style=\"border-radius: 12px; background: #ffffff; padding: 12px;\" />"
                    + "<div style=\"font-family: monospace; font-size: 14px; letter-spacing: 2px; color: #d4d8ff; margin-top: 12px;\">" + qrCodeValue + "</div>"
                    + "</div>"
                    + "<p style=\"margin: 0; color: #ffffff; font-size: 14px; font-weight: 600; line-height: 1.5;\">A PDF copy is also available in your student portal.</p>"
                    + "</td></tr>"
                    + "</table>"
                    + "<div style=\"text-align: center; margin-top: 30px;\"><p style=\"color: #64748b; font-size: 12px;\">&copy; 2026 Driving Exam Governance System</p></div>"
                    + "</body></html>";

            helper.setText(html, true);
            helper.addInline("qrCodeImage", new jakarta.mail.util.ByteArrayDataSource(qrPngBytes, "image/png"));
            mailSender.send(message);
        } catch (jakarta.mail.MessagingException e) {
            throw new RuntimeException("Failed to send payment QR code email", e);
        }
    }

    private void sendHtmlEmail(String toEmail, String subject, String title, String mainHeading, String description,
            String codeBoxHtml, String footerText) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            String html = "<!DOCTYPE html>"
                    + "<html><head><meta charset=\"UTF-8\"></head>"
                    + "<body style=\"margin: 0; padding: 40px 20px; background-color: #151618; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\">"

                    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 600px; margin: 0 auto; background-color: #1e1e21; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);\">"
                    + "<tr>"
                    + "<td style=\"background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 45px 30px; text-align: center;\">"
                    + "<h1 style=\"margin: 0 0 15px 0; color: #ffffff; font-size: 28px; font-weight: 700;\">Driving Exam Governance</h1>"
                    + "<p style=\"margin: 0; color: #e0e7ff; font-size: 15px; font-weight: 500;\">" + title + "</p>"
                    + "</td>"
                    + "</tr>"

                    + "<tr>"
                    + "<td style=\"padding: 45px 30px;\">"
                    + "<h2 style=\"margin: 0 0 20px 0; color: #ffffff; font-size: 22px; font-weight: 600;\">"
                    + mainHeading + "</h2>"
                    + "<p style=\"margin: 0 0 10px 0; color: #e2e8f0; font-size: 15px; line-height: 1.6;\">"
                    + description + "</p>"

                    + codeBoxHtml

                    + "<p style=\"margin: 0; color: #ffffff; font-size: 14px; font-weight: 600; line-height: 1.5;\">"
                    + footerText + "</p>"
                    + "</td>"
                    + "</tr>"
                    + "</table>"

                    + "<div style=\"text-align: center; margin-top: 30px;\">"
                    + "<p style=\"color: #64748b; font-size: 12px;\">&copy; 2026 Driving Exam Governance System</p>"
                    + "</div>"

                    + "</body></html>";

            helper.setText(html, true);
            mailSender.send(message);

        } catch (jakarta.mail.MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
