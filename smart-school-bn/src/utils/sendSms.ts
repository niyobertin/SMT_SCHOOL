import africastalking from "africastalking";

const africastalkingClient = africastalking({
  apiKey: process.env.AT_API_KEY as string,   
  username: process.env.AT_USERNAME || "sandbox", 
});

const sms = africastalkingClient.SMS;

interface SmsResponse {
  SMSMessageData: {
    Message: string;
    Recipients: Array<{
      status: string;
      number: string;
      messageId: string;
      cost: string;
    }>;
  };
}

export const sendSmsTo = async (to: string, message: string): Promise<SmsResponse> => {
  try {
    const response = (await sms.send({
      to: [to], 
      message,
      from: process.env.AT_SENDER_ID || "AFRICASTKNG", 
    })) as unknown as SmsResponse;
    
    console.log("Africa's Talking SMS response:", response);
    return response;
  } catch (error: any) {
    console.error("Africa's Talking SMS error:", error);
    throw new Error("Failed to send SMS");
  }
};
