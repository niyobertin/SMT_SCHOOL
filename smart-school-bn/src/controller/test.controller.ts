import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { NotFoundError } from "../utils/errors";
import { uploadBufferToCloudinary } from "../config/cloudinary";

const prisma = new PrismaClient();

export const getTestByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const test = await prisma.test.findMany({
      where: { courseId },
      skip,
      take: limit,
      include: {
        questions: true,
      },
    });

    if (!test) {
      throw new NotFoundError('Test not found');
    }

    res.status(200).json({
      status: 'success',
      data: test,
      pagination: {
        page,
        limit,
        total: test.length,
        totalPages: Math.ceil(test.length / limit),
      },
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
    const { title, description, instructions, duration, passingScore, maxAttempts, randomizeQuestions, showResults } = req.body;
    const { courseId } = req.params;

    // Verify user owns the course
    // @ts-ignore
    const userId = req.user?.id;
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
        passingScore: passingScore || 70,
        maxAttempts: maxAttempts || null,
        randomizeQuestions: randomizeQuestions !== false, // default true
        showResults: showResults !== false, // default true
        course: {
          connect: { id: courseId },
        },
      },
    });

    res.status(201).json({
      status: "success",
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
    const test = await prisma.test.findFirst({
      where: {
        id: testId
      },
    });

    if (!test) {
      res.status(404).json({
        status: "error",
        message: "Test not found",
      });
      return;
    }

    // Get current max order to set for the new question
    const lastQuestion = await prisma.question.findFirst({
      where: { testId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastQuestion ? lastQuestion.order + 1 : 0;
    const imageFile = files?.["fileImage"]?.[0];
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadBufferToCloudinary(imageFile.buffer, imageFile.mimetype);
    }
    // Create question with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      const newQuestion = await tx.question.create({
        data: {
          id: uuidv4(),
          question,
          image: imageUrl,
          type,
          points: Number(points || 1),
          explanation: explanation || null,
          order: newOrder,
          test: {
            connect: { id: testId },
          },
        },
      });

      // Add options if it's a multiple choice question

      if (options && options.length > 0 && (type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE')) {
        await Promise.all(
          options.map((opt: { option: string; isCorrect: any }, index: number) =>
            tx.questionOption.create({
              data: {
                id: uuidv4(),
                option: opt.option,
                isCorrect: opt.isCorrect === true || opt.isCorrect === 'true',
                order: index,
                question: {
                  connect: { id: newQuestion.id },
                },
              },
            })
          )
        );
      }

      return newQuestion;
    });

    // Get the full question with options
    const createdQuestion = await prisma.question.findUnique({
      where: { id: result.id },
      include: { options: true },
    });

    res.status(201).json({
      status: "success",
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
      throw new NotFoundError('Test not found');
    }

    res.status(200).json({
      status: 'success',
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
      throw new NotFoundError('Test not found');
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
      orderBy: { order: 'asc' },
    });

    res.status(200).json({
      status: 'success',
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
    // @ts-ignore
    const userId = req.user?.id;

    // Check if user is enrolled in the course
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: {
          include: {
            enrollments: {
              where: {
                userId,
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });
    // Get questions
    const questions = await prisma.question.findMany({
      where: { testId, isActive: true },
      include: {
        options: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            option: true,
            order: true,
          },
        },
      },
      orderBy: test?.randomizeQuestions
        ? { id: 'asc' }
        : { order: 'asc' },
    });

    if (questions.length === 0) {
      res.status(400).json({
        status: "error",
        message: "No questions available for this test",
      });
      return;
    }

    // Randomize questions if needed
    const randomizedQuestions = test?.randomizeQuestions
      ? questions.sort(() => Math.random() - 0.5)
      : questions;

    // Create test attempt
    const testAttempt = await prisma.testAttempt.create({
      data: {
        id: uuidv4(),
        totalQuestions: questions.length,
        test: {
          connect: { id: testId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    // Calculate end time if duration is set
    const endTime = test?.duration
      ? new Date(Date.now() + test.duration * 60 * 1000)
      : null;

    res.status(200).json({
      status: "success",
      data: {
        attemptId: testAttempt.id,
        test: {
          id: test?.id,
          title: test?.title,
          description: test?.description,
          instructions: test?.instructions,
          duration: test?.duration,
          passingScore: test?.passingScore,
          showResults: test?.showResults,
        },
        questions: randomizedQuestions.map(q => ({
          id: q.id,
          question: q.question,
          image: q.image,
          type: q.type,
          points: q.points,
          options: q.options,
          order: q.order,
        })),
        startTime: testAttempt.startTime,
        endTime,
        timeRemaining: test?.duration ? test.duration * 60 : null, // in seconds
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
    // @ts-ignore
    const userId = req.user?.id;

    // Validate test attempt
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      },
      include: {
        test: {
          include: {
            questions: {
              where: { id: questionId },
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!testAttempt) {
      res.status(404).json({
        status: "error",
        message: "Test attempt not found ",
      });
      return;
    } else if (testAttempt.status === 'COMPLETED') {
      res.status(400).json({
        status: "error",
        message: "Test attempt already completed",
      });
      return;
    }

    const question = testAttempt.test.questions[0];
    if (!question) {
      res.status(404).json({
        status: "error",
        message: "Question not found in this test",
      });
      return;
    }

    // Get the selected option texts
    const selectedOptionTexts = question.options
      .filter(opt => selectedOptions?.includes(opt.id))
      .map(opt => opt.option);

    // Check if answer already exists
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        testAttemptId: attemptId,
        questionId,
      },
    });

    let isCorrect = false;
    let points = 0;

    // Auto-grade if possible
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
      const correctOptions = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);

      const selected = Array.isArray(selectedOptions) ? selectedOptions : [];

      // Check if all correct options are selected and no incorrect ones
      isCorrect = correctOptions.length === selected.length &&
        correctOptions.every(optId => selected.includes(optId));

      points = isCorrect ? question.points : 0;
    }
    // For other question types, manual grading is required

    // Create or update answer
    const answer = await prisma.answer.upsert({
      where: {
        id: existingAnswer?.id || uuidv4(),
      },
      create: {
        id: uuidv4(),
        answerText: answerText || null,
        selectedOptions: selectedOptions || [],
        userAnswer: selectedOptionTexts || [],
        isCorrect,
        points,
        testAttempt: {
          connect: { id: attemptId },
        },
        question: {
          connect: { id: questionId },
        },
      },
      update: {
        answerText: answerText || null,
        selectedOptions: selectedOptions || [],
        userAnswer: selectedOptionTexts || [],
        isCorrect,
        points,
      },
    });

    // Update test attempt stats
    const answers = await prisma.answer.findMany({
      where: { testAttemptId: attemptId },
    });

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalPoints = answers.reduce((sum, a) => sum + (a.points || 0), 0);

    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        correctAnswers,
        score: (totalPoints / testAttempt.totalQuestions) * 100,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        answer,
        isCorrect,
        points,
        correctAnswers,
        totalAnswered: answers.length,
        totalQuestions: testAttempt.totalQuestions,
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
    // @ts-ignore
    const userId = req.user?.id;
    // 1. Validate test attempt
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      },
      include: {
        test: {
          include: {
            course: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!testAttempt) {
      throw new NotFoundError('Test attempt not found ');
    }

    // 2. Calculate final score
    const questions = await prisma.question.findMany({
      where: { testId: testAttempt.testId },
    });

    const totalScoreForQuestions = questions.reduce((sum, q) => sum + (q.points || 0), 0);
    const totalQuestions = questions.length;
    const answeredQuestions = testAttempt.answers.length;
    const correctAnswers = testAttempt.answers.filter(a => a.isCorrect).length;
    const totalPoints = testAttempt.answers.reduce((sum, a) => sum + (a.points || 0), 0);
    const score = (totalPoints / totalScoreForQuestions) * 100;
    const isPassed = score >= testAttempt.test.passingScore;

    // 3. Update test attempt
    const now = new Date();
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        endTime: now,
        score,
        isPassed,
        status: 'COMPLETED',
        timeSpent: Math.floor((now.getTime() - testAttempt.startTime.getTime()) / 1000 / 60), // in minutes
      },
    });

    // 4. Update user progress and record achievement if passed
    if (isPassed) {
      await updateUserProgress(userId, testAttempt.test.courseId, testAttempt.testId);
    }

    // 5. Generate results
    const response: any = {
      status: "success",
      data: {
        attemptId: testAttempt.id,
        score,
        isPassed,
        passingScore: testAttempt.test.passingScore,
        totalQuestions,
        answeredQuestions,
        correctAnswers,
        pointsEarned: totalPoints,
        totalPoints: totalScoreForQuestions,
        timeSpent: Math.floor((now.getTime() - testAttempt.startTime.getTime()) / 1000 / 60),
        submittedAt: now.toISOString()
      },
      message: "Test submitted successfully",
    };

    // 6. Include detailed results if showResults is enabled
    if (testAttempt.test.showResults) {
      const detailedAnswers = await prisma.answer.findMany({
        where: { testAttemptId: attemptId },
        include: {
          question: {
            include: {
              options: {
                where: { isCorrect: true },
                select: { id: true, option: true }
              }
            }
          }
        },
      });

      response.data.details = detailedAnswers.map(a => ({
        questionId: a.questionId,
        question: a.question.question,
        type: a.question.type,
        isCorrect: a.isCorrect,
        points: a.points,
        userAnswer: a.answerText || a.userAnswer,
        correctAnswers: a.question.options.map(opt => ({
          id: opt.id,
          option: opt.option
        }))
      }));
    }

    // 7. Send notifications
    await sendTestCompletionNotification(userId, testAttempt.test, isPassed, score);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Helper functions
const updateUserProgress = async (userId: string, courseId: string, testId: string) => {
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
    console.error('Error updating user course progress:', error);
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
        type: 'TEST_GRADED',
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
          type: 'TEST_GRADED',
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
    logger.error('Error sending test completion notification:', error);
  }
};

export const updateTestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { testId } = req.params;
    const { title, description, passingScore, randomizeQuestions, showResults } = req.body;
    const existingTest = await prisma.test.findUnique({ where: { id: testId } });

    if (!existingTest) {
      throw new NotFoundError('Test not found');
    }

    const test = await prisma.test.update({
      where: { id: testId },
      data: { title, description, passingScore, randomizeQuestions: randomizeQuestions !== false, showResults: showResults !== false },
    });

    res.status(200).json({
      status: "success",
      data: test,
      message: "Test updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { testId } = req.params;
    const existingTest = await prisma.test.findUnique({ where: { id: testId } });

    if (!existingTest) {
      throw new NotFoundError('Test not found');
    }

    await prisma.test.delete({ where: { id: testId } });

    res.status(200).json({
      status: "success",
      message: "Test deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateTestQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { questionId } = req.params;
    const { question, type, options, points, order, explanation } = req.body;

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
        points,
        order,
        explanation,
        options: options
          ? {
            deleteMany: {},
            create: options.map((opt: any, idx: number) => ({
              id: uuidv4(),
              option: opt.option,
              isCorrect: opt.isCorrect || false,
              order: idx,
            })),
          }
          : undefined,
      },
      include: { options: true },
    });

    res.status(200).json({
      status: "success",
      data: updatedQuestion,
      message: "Question updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


export const deleteTestQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { questionId } = req.params;
    const existingQuestion = await prisma.question.findUnique({ where: { id: questionId } });

    if (!existingQuestion) {
      throw new NotFoundError('Question not found');
    }

    await prisma.question.delete({ where: { id: questionId } });

    res.status(200).json({
      status: "success",
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadQuestionsExcel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { testId } = req.params;
    // @ts-ignore
    const userId = req.user?.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const test = await prisma.test.findFirst({
      where: {
        id: testId,
        course: { instructorId: userId },
      },
    });
    if (!test) {
      res.status(404).json({ status: "error", message: "Test not found or no permission" });
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
        const {
          question,
          type,
          points,
          explanation,
          options,
          correct,
        } = row;

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
          const optionArr = String(options).split(",").map((s: string) => s.trim());
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
      status: "success",
      message: `${created.length} questions uploaded successfully`,
      data: created,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
