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
