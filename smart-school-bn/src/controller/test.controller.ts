import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { NotFoundError } from "../utils/errors";
import { uploadBufferToCloudinary } from "../config/cloudinary";
import { sendTestResponseEmail } from "../services/testResponseEmail.service";
import prisma from "../services/prisma.singleton";
import { QuestionService } from "../services/question.service";
import { AttemptService } from "../services/attempt.service";

export const getTestByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const test = await prisma.test.findMany({
      where: { courseId },
      include: {
        questions: true,
      },
    });

    if (!test) {
      throw new NotFoundError("Test not found");
    }

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    next(error);
  }
};
// Test Management Endpoints
export const createTest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      instructions,
      duration,
      type,
      passingScore,
      maxAttempts,
      randomizeQuestions,
      showResults,
    } = req.body;
    const { courseId } = req.params;

    // Verify user owns the course
    const userId = (req.user as any)?.id;
    const course = await prisma.course.findUnique({
      where: { id: courseId, instructorId: userId },
    });

    if (!course) {
      res.status(404).json({
        status: "error",
        message: "Course not found or you don't have permission",
      });
      return;
    }

    // Create test
    const test = await prisma.test.create({
      data: {
        id: uuidv4(),
        title,
        description: description || null,
        instructions: instructions || [],
        duration: duration || null,
        type: type || "GENERAL",
        passingScore: passingScore || 70,
        maxAttempts: maxAttempts || null,
        randomizeQuestions: randomizeQuestions !== false,
        showResults: showResults !== false,
        course: {
          connect: { id: courseId },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: test,
      message: "Test created successfully",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const addQuestionToTest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testId } = req.params;
    const { question, type, points, explanation, options } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Verify test exists
    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) {
      res.status(404).json({
        success: false,
        error: {
          message: "Test not found",
          code: "TEST_NOT_FOUND"
        }
      });
      return;
    }

    const lastQuestion = await prisma.question.findFirst({
      where: { testId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastQuestion ? lastQuestion.order + 1 : 0;
    const imageFile = files?.["fileImage"]?.[0];
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadBufferToCloudinary(
        imageFile.buffer,
        imageFile.mimetype
      );
    }

    const createdQuestion = await QuestionService.createQuestion(testId, {
      question,
      type,
      points: Number(points || 1),
      explanation: explanation || null,
      order: newOrder,
      image: imageUrl,
      options: options ? options.map((opt: any, index: number) => ({
        option: opt.option,
        isCorrect: opt.isCorrect === true || opt.isCorrect === "true",
        order: index
      })) : undefined
    }, 'test');

    res.status(201).json({
      success: true,
      data: createdQuestion,
      message: "Question added successfully",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

// Get test by ID
export const getTestById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundError("Test not found");
    }

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    next(error);
  }
};

// Get questions for a test
export const getTestQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testId } = req.params;

    // Verify test exists
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundError("Test not found");
    }

    // Get questions for the test
    const questions = await prisma.question.findMany({
      where: { testId },
      select: {
        id: true,
        question: true,
        type: true,
        options: true,
        points: true,
        order: true,
        image: true,
      },
      orderBy: { order: "asc" },
    });

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

// Test Taking Endpoints
export const startTestAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testId } = req.params;
    const userId = (req.user as any)?.id;

    // Check if user is enrolled (Specific to LMS)
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { userId, status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (!test || test.course.enrollments.length === 0) {
      res.status(403).json({ status: "error", message: "Not enrolled in this course" });
      return;
    }

    const testAttempt = await AttemptService.startAttempt(testId, userId, 'test');

    // Get questions for the response
    const questions = await prisma.question.findMany({
      where: { testId, isActive: true },
      include: {
        options: {
          orderBy: { order: "asc" },
          select: { id: true, option: true, order: true },
        },
      },
      orderBy: test.randomizeQuestions ? { id: "asc" } : { order: "asc" },
    });

    const randomizedQuestions = test.randomizeQuestions
      ? questions.sort(() => Math.random() - 0.5)
      : questions;

    res.status(200).json({
      success: true,
      data: {
        attemptId: testAttempt.id,
        test: {
          id: test.id,
          title: test.title,
          duration: test.duration,
          passingScore: test.passingScore,
          showResults: test.showResults,
        },
        questions: randomizedQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
        })),
        startTime: testAttempt.startTime,
        timeRemaining: test.duration ? test.duration * 60 : null,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const { questionId, answerText, selectedOptions } = req.body;
    const userId = (req.user as any)?.id;

    // Validate test attempt belongs to user
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!testAttempt || testAttempt.userId !== userId) {
      res.status(404).json({ status: "error", message: "Test attempt not found" });
      return;
    }

    if (testAttempt.status === "COMPLETED") {
      res.status(400).json({ status: "error", message: "Test attempt already completed" });
      return;
    }

    const { isCorrect, points } = await AttemptService.submitAnswer(attemptId, {
      questionId,
      answerText,
      selectedOptions
    }, 'test');

    const stats = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        points,
        correctAnswers: stats?.correctAnswers,
        totalQuestions: stats?.totalQuestions,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const submitTest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const userId = (req.user as any)?.id;

    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { include: { course: true } },
        user: true,
      }
    });

    if (!testAttempt || testAttempt.userId !== userId) {
      throw new NotFoundError("Test attempt not found");
    }

    const updatedAttempt = await AttemptService.finalizeAttempt(attemptId, 'test');

    // Update user progress
    if (updatedAttempt.isPassed) {
      await updateUserProgress(userId, testAttempt.test.courseId, testAttempt.testId);
    }

    // Email notification for subjective tests
    if (testAttempt.test.type === "INTERVIEW" || testAttempt.test.type === "OPENENDED") {
      await sendTestResponseEmailNotification(testAttempt, userId);
    }

    const response: any = {
      success: true,
      data: {
        attemptId: updatedAttempt.id,
        score: updatedAttempt.score,
        isPassed: updatedAttempt.isPassed,
        passingScore: testAttempt.test.passingScore,
        totalQuestions: updatedAttempt.totalQuestions,
        correctAnswers: updatedAttempt.correctAnswers,
        timeSpent: updatedAttempt.timeSpent,
        submittedAt: updatedAttempt.endTime?.toISOString(),
      },
      message: "Test submitted successfully",
    };

    if (testAttempt.test.showResults) {
      const detailedAnswers = await prisma.answer.findMany({
        where: { testAttemptId: attemptId },
        include: {
          question: { include: { options: { where: { isCorrect: true } } } },
        },
      });

      response.data.details = detailedAnswers.map((a) => ({
        questionId: a.questionId,
        question: a.question.question,
        type: a.question.type,
        isCorrect: a.isCorrect,
        points: a.points,
        userAnswer: a.answerText || a.userAnswer,
        correctAnswers: a.question.options.map((opt) => ({
          id: opt.id,
          option: opt.option,
        })),
      }));
    }

    await sendTestCompletionNotification(userId, testAttempt.test, updatedAttempt.isPassed, updatedAttempt.score || 0);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Helper functions
const updateUserProgress = async (
  userId: string,
  courseId: string,
  testId: string
) => {
  try {
    await prisma.userCourseProgress.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        completedTests: {
          push: testId,
        },
        lastAccessed: new Date(),
      },
      create: {
        userId,
        courseId,
        completedTests: [testId],
        lastAccessed: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating user course progress:", error);
    throw error;
  }
};

const sendTestCompletionNotification = async (
  userId: string,
  test: any,
  isPassed: boolean,
  score: number
) => {
  try {
    // Send notification to student
    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: test.course.instructorId,
        type: "TEST_GRADED",
        title: `Student completed test "${test.title}"`,
        message: `A student has completed the test with ${score.toFixed(2)}%`,
        metadata: {
          testId: test.id,
          studentId: userId,
          score,
          passed: isPassed,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Send notification to instructor if needed
    if (test.notifyInstructor) {
      await prisma.notification.create({
        data: {
          id: uuidv4(),
          userId: test.course.instructorId,
          type: "TEST_GRADED",
          title: `Student completed test "${test.title}"`,
          message: `A student has completed the test with ${score.toFixed(2)}%`,
          metadata: {
            testId: test.id,
            studentId: userId,
            score,
            passed: isPassed,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
  } catch (error) {
    logger.error("Error sending test completion notification:", error);
  }
};

// Send email notification for INTERVIEW and OPENENDED test responses
const sendTestResponseEmailNotification = async (
  testAttempt: any,
  userId: string
) => {
  try {
    const instructor = testAttempt.test.course.instructor;
    const student = testAttempt.user;

    if (!instructor || !instructor.email) {
      logger.warn(`No instructor email found for test ${testAttempt.test.title}`);
      return;
    }

    // Get all answers with questions
    const answersWithQuestions = await prisma.answer.findMany({
      where: { testAttemptId: testAttempt.id },
      include: {
        question: true,
      },
      orderBy: {
        question: {
          order: 'asc',
        },
      },
    });

    // Format questions and responses for email
    const questions = answersWithQuestions.map((answer) => ({
      question: answer.question.question,
      image: answer.question.image || undefined,
      studentAnswer: answer.answerText || "No response provided",
      solution: answer.question.explanation || undefined,
      explanation: answer.question.explanation || undefined,
    }));

    // Send email
    await sendTestResponseEmail({
      instructorEmail: instructor.email,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      testTitle: testAttempt.test.title,
      testType: testAttempt.test.type,
      submissionTime: testAttempt.endTime?.toISOString() || new Date().toISOString(),
      questions,
    });

    logger.info(
      `Test response email sent to ${instructor.email} for ${testAttempt.test.type} test: ${testAttempt.test.title}`
    );
  } catch (error) {
    logger.error("Error sending test response email:", error);
    // Don't throw - email failure shouldn't block test submission
  }
};

export const updateTestById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testId } = req.params;
    const {
      title,
      description,
      passingScore,
      randomizeQuestions,
      showResults,
      duration,
      type,
      maxAttempts,
      instructions,
    } = req.body;
    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!existingTest) {
      throw new NotFoundError("Test not found");
    }

    // Build update data: include all fields the frontend may send (duration, type, maxAttempts, instructions)
    const updateData: Record<string, unknown> = {
      title,
      description,
      passingScore,
      randomizeQuestions: randomizeQuestions !== false,
      showResults: showResults !== false,
    };
    if (duration !== undefined) updateData.duration = duration === null ? null : Number(duration);
    if (type !== undefined) updateData.type = type;
    if (maxAttempts !== undefined) updateData.maxAttempts = maxAttempts === null ? null : Number(maxAttempts);
    if (instructions !== undefined) updateData.instructions = Array.isArray(instructions) ? instructions : instructions;

    const test = await prisma.test.update({
      where: { id: testId },
      data: updateData as any,
    });

    res.status(200).json({
      success: true,
      data: test,
      message: "Test updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTestById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testId } = req.params;
    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!existingTest) {
      throw new NotFoundError("Test not found");
    }

    await prisma.test.delete({ where: { id: testId } });

    res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateTestQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { questionId } = req.params;
    const { question, type, options, points, order, explanation } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageFile = files?.["fileImage"]?.[0];
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadBufferToCloudinary(
        imageFile.buffer,
        imageFile.mimetype
      );
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!existingQuestion) {
      throw new NotFoundError("Question not found");
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        question,
        type,
        points: Number(points),
        order,
        explanation,
        image: imageUrl,
        options: options
          ? {
            deleteMany: {},
            create: options.map((opt: any, idx: number) => ({
              id: uuidv4(),
              option: opt.option,
              isCorrect: (opt.isCorrect === "true" || opt.isCorrect === true) || false,
              order: idx,
            })),
          }
          : undefined,
      },
      include: { options: true },
    });

    res.status(200).json({
      success: true,
      data: updatedQuestion,
      message: "Question updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTestQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { questionId } = req.params;
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      throw new NotFoundError("Question not found");
    }

    await prisma.question.delete({ where: { id: questionId } });

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadQuestionsExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { testId } = req.params;
    // @ts-ignore
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const test = await prisma.test.findFirst({
      where: {
        id: testId,
      },
    });
    if (!test) {
      res.status(404).json({ status: "error", message: "Test not found" });
      return;
    }
    if (files.file.length === 0) {
      res.status(400).json({ status: "error", message: "No file uploaded" });
      return;
    }

    const workbook = XLSX.read(files.file[0].buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      res.status(400).json({ status: "error", message: "Empty Excel file" });
      return;
    }
    const lastQuestion = await prisma.question.findFirst({
      where: { testId },
      orderBy: { order: "desc" },
    });
    let currentOrder = lastQuestion ? lastQuestion.order + 1 : 0;
    const created = await prisma.$transaction(async (tx) => {
      const results: any[] = [];

      for (const row of data) {
        const { question, type, points, explanation, options, correct } = row;

        const newQ = await tx.question.create({
          data: {
            id: uuidv4(),
            question,
            type,
            points: Number(points) || 1,
            explanation: explanation || null,
            order: currentOrder++,
            test: { connect: { id: testId } },
          },
        });

        if (options && (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE")) {
          const optionArr = String(options)
            .split(",")
            .map((s: string) => s.trim());
          const correctArr = String(correct || "")
            .split(",")
            .map((s: string) => s.trim());

          await Promise.all(
            optionArr.map((opt: string, idx: number) =>
              tx.questionOption.create({
                data: {
                  id: uuidv4(),
                  option: opt,
                  isCorrect: correctArr.includes(opt),
                  order: idx,
                  question: { connect: { id: newQ.id } },
                },
              })
            )
          );
        }

        results.push(newQ);
      }

      return results;
    });

    res.status(201).json({
      success: true,
      message: `${created.length} questions uploaded successfully`,
      data: created,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
