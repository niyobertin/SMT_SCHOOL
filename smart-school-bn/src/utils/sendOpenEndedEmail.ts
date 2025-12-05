import { sendEmail } from '../utils/sendEmail';

interface OpenEndedEmailData {
    instructorEmail: string;
    instructorName: string;
    studentName: string;
    studentEmail: string;
    testTitle: string;
    questionText: string;
    openEndedResponse: string;
    timestamp: string;
}

export const sendOpenEndedResponseEmail = async (data: OpenEndedEmailData): Promise<void> => {
    const {
        instructorEmail,
        instructorName,
        studentName,
        studentEmail,
        testTitle,
        questionText,
        openEndedResponse,
        timestamp
    } = data;

    const subject = `New Open-Ended Response: ${testTitle}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 20px;
          border: 1px solid #e5e7eb;
        }
        .section {
          background-color: white;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 6px;
          border-left: 4px solid #4F46E5;
        }
        .label {
          font-weight: bold;
          color: #4F46E5;
          margin-bottom: 5px;
        }
        .response-box {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          margin-top: 10px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📝 New Open-Ended Response Submitted</h2>
        </div>
        
        <div class="content">
          <p>Dear ${instructorName},</p>
          <p>A student has submitted an open-ended response for your psychometric test. Here are the details:</p>
          
          <div class="section">
            <div class="label">Test:</div>
            <div>${testTitle}</div>
          </div>
          
          <div class="section">
            <div class="label">Student:</div>
            <div>${studentName}</div>
            <div style="color: #6b7280; font-size: 14px;">${studentEmail}</div>
          </div>
          
          <div class="section">
            <div class="label">Question:</div>
            <div>${questionText}</div>
          </div>
          
          <div class="section">
            <div class="label">Open-Ended Response:</div>
            <div class="response-box">
              ${openEndedResponse}
            </div>
          </div>
          
          <div class="section">
            <div class="label">Submitted At:</div>
            <div>${timestamp}</div>
          </div>
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Dashboard
            </a>
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from Smart School.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `
New Open-Ended Response Submitted

Dear ${instructorName},

A student has submitted an open-ended response for your psychometric test.

Test: ${testTitle}
Student: ${studentName} (${studentEmail})
Question: ${questionText}

Open-Ended Response:
${openEndedResponse}

Submitted At: ${timestamp}

View in Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard
  `;

    await sendEmail({
        to: instructorEmail,
        subject,
        text,
        html
    });
};
