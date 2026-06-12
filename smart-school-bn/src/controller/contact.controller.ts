import { Request, Response } from "express";
import { sendEmail } from "../utils/sendEmail";

export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required: name, email, subject, message",
      });
    }

    await sendEmail({
      to: process.env.CONTACT_EMAIL || "jobexamrwanda@gmail.com",
      subject: `Contact Form: ${subject}`,
      text: `From: ${name} (${email})\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #1a7ea5;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
          <p style="white-space: pre-wrap;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">Sent from JobExam Rwanda contact form</p>
        </div>
      `,
    });

    res.status(200).json({
      status: "success",
      message: "Your message has been sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send your message. Please try again later.",
    });
  }
};
