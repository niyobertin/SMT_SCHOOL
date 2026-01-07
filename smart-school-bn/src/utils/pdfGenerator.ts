import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateOpenEndedPDF = (
    responses: any[],
    examTitle: string,
    res: Response
) => {
    const doc = new PDFDocument({ margin: 50 });

    const filename = `${examTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Exam Responses Export', { align: 'center' });
    doc.fontSize(14).text(examTitle, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Group by Question or Candidate? Let's do by Question for easier marking review
    // But the request implies per-candidate export? "Open-ended responses". 
    // Usually markers want to see all answers for Q1, then Q2. 
    // Let's stick to the list order passed in.

    responses.forEach((response, index) => {
        // Candidate Header
        doc.rect(50, doc.y, 500, 25).fill('#f0f0f0').stroke();
        doc.fillColor('#000000').fontSize(12).text(
            `${response.candidate.firstName} ${response.candidate.lastName} (${response.candidate.candidateId || 'N/A'})`,
            60,
            doc.y - 18
        );
        doc.moveDown(1.5);

        // Question
        doc.fontSize(11).font('Helvetica-Bold').text('Question:', { continued: true });
        doc.font('Helvetica').text(` ${response.question.question} (${response.question.points} pts)`);

        doc.moveDown(0.5);

        // Answer
        doc.font('Helvetica-Bold').text('Answer:');
        doc.font('Helvetica').fontSize(10).text(response.answerText || 'No answer provided.');

        doc.moveDown(0.5);

        // Score/Feedback if marked
        if (response.manualScore !== null && response.manualScore !== undefined) {
            doc.font('Helvetica-Bold').text('Score: ', { continued: true });
            doc.font('Helvetica').text(`${response.manualScore}/${response.question.points}`);

            if (response.feedback) {
                doc.font('Helvetica-Bold').text('Feedback: ', { continued: true });
                doc.font('Helvetica').text(response.feedback);
            }
        } else {
            doc.fontSize(9).text('Status: Pending Marking', { oblique: true });
        }

        doc.moveDown(2);

        // Add page break if needed, though pdfkit handles auto-flow well.
        // We can force a new page for every candidate if desired, but continuous is better for printing.
    });

    doc.end();
};

export const generateDetailedResultsPDF = (
    attempts: any[],
    examTitle: string,
    res: Response
) => {
    const doc = new PDFDocument({ margin: 50 });

    const filename = `${examTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_detailed_results.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('Detailed Examination Report', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text(examTitle, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    attempts.forEach((attempt, aIndex) => {
        // Candidate Section Header (No background)
        doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text(
            `Candidate: ${attempt.candidate.firstName} ${attempt.candidate.lastName} (${attempt.candidate.candidateId || 'N/A'})`,
            50,
            doc.y
        );
        doc.moveDown(1.5);

        // Attempt Summary
        doc.fontSize(12).font('Helvetica-Bold').text('Attempt Summary:');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Score: ${attempt.score?.toFixed(2)}% (${attempt.isPassed ? 'PASSED' : 'FAILED'})`);
        doc.text(`Total Questions: ${attempt.totalQuestions}`);
        doc.text(`Completed at: ${attempt.endTime ? new Date(attempt.endTime).toLocaleString() : 'N/A'}`);
        doc.moveDown();

        // Answers
        doc.fontSize(12).font('Helvetica-Bold').text('Detailed Answers:');
        doc.moveDown(0.5);

        attempt.answers.forEach((answer: any, qIndex: number) => {
            const questionText = answer.examQuestion?.question || 'Unknown Question';
            const points = answer.points || 0;
            const maxPoints = answer.examQuestion?.points || 0;

            doc.fontSize(11).font('Helvetica-Bold').text(`${qIndex + 1}. ${questionText}`);
            doc.fontSize(10).font('Helvetica');

            // Display User Answer
            if (answer.examQuestion?.type === 'MULTIPLE_CHOICE' || answer.examQuestion?.type === 'TRUE_FALSE') {
                doc.text('Answer: ', { continued: true }).font('Helvetica-Bold').text(answer.userAnswer?.join(', ') || 'N/A');
            } else {
                doc.text('Answer: ').font('Helvetica').text(answer.answerText || 'N/A', { indent: 15 });
            }

            doc.font('Helvetica').text(`Marks: ${points}/${maxPoints}`, { align: 'right' });

            if (answer.feedback) {
                doc.font('Helvetica-Oblique').text(`Examiner Feedback: ${answer.feedback}`, { indent: 15 });
            }

            doc.moveDown();

            // Page break check (rough estimation)
            if (doc.y > 700) {
                doc.addPage();
            }
        });

        if (aIndex < attempts.length - 1) {
            doc.addPage();
        }
    });

    doc.end();
};
