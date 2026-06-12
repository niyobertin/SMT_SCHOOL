import { sendEmail } from "../utils/sendEmail";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

interface TestResponseEmailData {
    instructorEmail: string;
    studentName: string;
    studentEmail: string;
    testTitle: string;
    testType: string;
    submissionTime: string;
    questions: Array<{
        question: string;
        image?: string;
        studentAnswer: string;
        solution?: string;
        explanation?: string;
    }>;
}

export const sendTestResponseEmail = async (
    data: TestResponseEmailData
): Promise<void> => {
    try {
        const {
            instructorEmail,
            studentName,
            studentEmail,
            testTitle,
            testType,
            submissionTime,
            questions,
        } = data;

        // Generate HTML email content
        const htmlContent = generateTestResponseHTML(data);

        // Send email
        await sendEmail({
            to: instructorEmail,
            subject: `New ${testType} Test Submission - ${testTitle} - ${studentName}`,
            html: htmlContent,
            text: `${studentName} has submitted a ${testType} test: ${testTitle}. Please check your email for details.`,
        });

        logger.info(
            `Test response email sent to ${instructorEmail} for test ${testTitle}`
        );
    } catch (error) {
        logger.error("Error sending test response email:", error);
        // Don't throw error - email failure shouldn't block test submission
    }
};

const generateTestResponseHTML = (
    data: TestResponseEmailData
): string => {
    const {
        studentName,
        studentEmail,
        testTitle,
        testType,
        submissionTime,
        questions,
    } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .student-info {
      background-color: #F3F4F6;
      padding: 20px;
      margin: 20px;
      border-radius: 6px;
      border-left: 4px solid #3B82F6;
    }
    .student-info h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #1F2937;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: 600;
      min-width: 140px;
      color: #4B5563;
    }
    .info-value {
      color: #1F2937;
    }
    .question-container {
      margin: 20px;
      padding: 20px;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
      background-color: #FAFAFA;
    }
    .question-header {
      font-size: 16px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #3B82F6;
    }
    .question-text {
      font-size: 15px;
      color: #374151;
      margin-bottom: 15px;
      line-height: 1.6;
    }
    .question-image {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 15px 0;
      border: 1px solid #E5E7EB;
    }
    .response-section {
      background-color: #FEF3C7;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      border-left: 4px solid #F59E0B;
    }
    .response-label {
      font-weight: 600;
      color: #92400E;
      margin-bottom: 8px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .response-text {
      color: #78350F;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.6;
    }
    .solution-section {
      background-color: #D1FAE5;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      border-left: 4px solid #10B981;
    }
    .solution-label {
      font-weight: 600;
      color: #065F46;
      margin-bottom: 8px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .solution-text {
      color: #047857;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.6;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6B7280;
      font-size: 13px;
      border-top: 1px solid #E5E7EB;
      margin-top: 20px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-interview {
      background-color: #DBEAFE;
      color: #1E40AF;
    }
    .badge-openended {
      background-color: #FEE2E2;
      color: #991B1B;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📝 New Test Submission</h1>
      <p>${testTitle}</p>
      <span class="badge ${testType === 'INTERVIEW' ? 'badge-interview' : 'badge-openended'}">${testType}</span>
    </div>

    <div class="student-info">
      <h2>👤 Student Information</h2>
      <div class="info-row">
        <span class="info-label">Student Name:</span>
        <span class="info-value">${studentName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Student Email:</span>
        <span class="info-value">${studentEmail}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Submitted At:</span>
        <span class="info-value">${new Date(submissionTime).toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Questions:</span>
        <span class="info-value">${questions.length}</span>
      </div>
    </div>

    ${questions
            .map(
                (q, index) => `
    <div class="question-container">
      <div class="question-header">
        Question ${index + 1}
      </div>
      <div class="question-text">
        ${q.question}
      </div>
      ${q.image
                        ? `<img src="${q.image}" alt="Question Image" class="question-image" />`
                        : ""
                    }
      
      <div class="response-section">
        <div class="response-label">Student Response</div>
        <div class="response-text">${q.studentAnswer || "No response provided"}</div>
      </div>

      ${q.solution
                        ? `
      <div class="solution-section">
        <div class="solution-label">Expected Answer / Solution</div>
        <div class="solution-text">${q.solution}</div>
      </div>
      `
                        : ""
                    }

      ${q.explanation
                        ? `
      <div class="solution-section">
        <div class="solution-label">Explanation</div>
        <div class="solution-text">${q.explanation}</div>
      </div>
      `
                        : ""
                    }
    </div>
    `
            )
            .join("")}

    <div class="footer">
      <p>This is an automated email from JobExam Rwanda.</p>
      <p>Please review the student's responses and provide feedback as needed.</p>
    </div>
  </div>
</body>
</html>
  `;
};
