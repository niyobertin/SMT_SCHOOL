import axios from "axios";

export const sendSmsTo = async (to: string, message: string) => {
  try {
    const response = await axios.post(
      "https://api.sms.to/sms/send",
      {
        to,        // recipient phone number (E.164 format, e.g. +2507XXXXXXX)
        message,   // SMS content
        sender_id: process.env.SMS_TO_SENDER || "SMTSchool", 
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SMS_TO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("SMS.to error:", error.response?.data || error.message);
    throw new Error("Failed to send SMS");
  }
};
