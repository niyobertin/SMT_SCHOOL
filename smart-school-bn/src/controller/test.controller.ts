import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { NotFoundError } from "../utils/errors";
import { uploadBufferToCloudinary } from "../config/cloudinary";
import { sendTestResponseEmail } from "../services/testResponseEmail.service";

const prisma = new PrismaClient();

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
      status: "success",
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
    // @ts-ignore
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role;

    const course = await prisma.course.findUnique({
      where: (userRole as any) === 'SUPER_ADMIN' ? { id: courseId } : { id: courseId, instructorId: userId },
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
        id: testId,
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

      if (
        options &&
        options.length > 0 &&
        (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE")
      ) {
        await Promise.all(
          options.map(
            (opt: { option: string; isCorrect: any }, index: number) =>
              tx.questionOption.create({
                data: {
                  id: uuidv4(),
                  option: opt.option,
                  isCorrect: opt.isCorrect === true || opt.isCorrect === "true",
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
      throw new NotFoundError("Test not found");
    }

    res.status(200).json({
      status: "success",
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
      status: "success",
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
    // @ts-ignore
    const userRole = req.user?.role;
    // @ts-ignore
    const studentId = req.studentId;

    const isStudent = userRole === "STUDENT";

    // 1. Fetch test and verify access/enrollment
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: {
          include: {
            enrollments: isStudent ? false : {
              where: { userId, status: "ACTIVE" },
            },
            studentEnrollments: !isStudent ? false : {
              where: { studentId: studentId },
            },
            assignments: !isStudent ? false : {
              where: {
                studentId: studentId,
              },
            },
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundError("Test not found");
    }

    // For students, check if enrolled or assigned
    if (isStudent) {
      const isAssigned = (test.course.assignments?.length || 0) > 0;
      const isEnrolled = (test.course.studentEnrollments?.length || 0) > 0;

      if (!isAssigned && !isEnrolled) {
        res.status(403).json({
          status: "error",
          message: "You are not enrolled in or assigned to this course",
        });
        return;
      }
    } else {
      // For staff, check if enrolled (if applicable) or if they are admin/instructor
      if (userRole !== "ADMIN" && userRole !== "INSTRUCTOR" && userRole !== "SUPER_ADMIN") {
        if ((test.course.enrollments?.length || 0) === 0) {
          res.status(403).json({
            status: "error",
            message: "You are not enrolled in this course",
          });
          return;
        }
      }
    }

    // 2. Get questions
    const questions = await prisma.question.findMany({
      where: { testId, isActive: true },
      include: {
        options: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            option: true,
            order: true,
          },
        },
      },
      orderBy: test.randomizeQuestions ? { id: "asc" } : { order: "asc" },
    });

    if (questions.length === 0) {
      res.status(400).json({
        status: "error",
        message: "No questions available for this test",
      });
      return;
    }

    // Randomize questions if needed
    const randomizedQuestions = test.randomizeQuestions
      ? questions.sort(() => Math.random() - 0.5)
      : questions;

    // 3. Create test attempt (Branch based on role)
    let attemptId: string;
    let startTime: Date;

    if (isStudent) {
      const studentAttempt = await prisma.studentTestAttempt.create({
        data: {
          id: uuidv4(),
          totalQuestions: questions.length,
          testId: testId,
          studentId: studentId,
        },
      });
      attemptId = studentAttempt.id;
      startTime = studentAttempt.startTime;
    } else {
      const testAttempt = await prisma.testAttempt.create({
        data: {
          id: uuidv4(),
          totalQuestions: questions.length,
          testId: testId,
          userId: userId,
        },
      });
      attemptId = testAttempt.id;
      startTime = testAttempt.startTime;
    }

    // Calculate end time if duration is set
    const durationEndTime = test.duration
      ? new Date(startTime.getTime() + test.duration * 60 * 1000)
      : null;

    res.status(200).json({
      status: "success",
      data: {
        attemptId,
        test: {
          id: test.id,
          title: test.title,
          description: test.description,
          instructions: test.instructions,
          duration: test.duration,
          passingScore: test.passingScore,
          showResults: test.showResults,
        },
        questions: randomizedQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          image: q.image,
          type: q.type,
          points: q.points,
          options: q.options,
          order: q.order,
        })),
        startTime,
        endTime: durationEndTime,
        timeRemaining: test.duration ? test.duration * 60 : null, // in seconds
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
    // @ts-ignore
    const userRole = req.user?.role;
    // @ts-ignore
    const studentId = req.studentId;

    const isStudent = userRole === "STUDENT";

    // 1. Fetch attempt and question
    let testAttempt: any;
    let questions: any[];

    if (isStudent) {
      testAttempt = await prisma.studentTestAttempt.findFirst({
        where: { id: attemptId, studentId: (userRole as any) === 'SUPER_ADMIN' ? undefined : studentId },
        include: {
          test: {
            include: {
              questions: {
                where: { id: questionId },
                include: { options: true },
              },
            },
          },
        },
      });
    } else {
      testAttempt = await prisma.testAttempt.findFirst({
        where: { id: attemptId, userId: (userRole as any) === 'SUPER_ADMIN' ? undefined : userId },
        include: {
          test: {
            include: {
              questions: {
                where: { id: questionId },
                include: { options: true },
              },
            },
          },
        },
      });
    }

    if (!testAttempt) {
      res.status(404).json({
        status: "error",
        message: "Test attempt not found",
      });
      return;
    } else if (testAttempt.status === "COMPLETED") {
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

    // 2. Grade the answer
    let isCorrect = false;
    let points = 0;

    if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
      const correctOptions = question.options
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.id);

      const selected = Array.isArray(selectedOptions) ? selectedOptions : [];

      isCorrect =
        correctOptions.length === selected.length &&
        correctOptions.every((optId: string) => selected.includes(optId));

      points = isCorrect ? question.points : 0;
    }

    // 3. Upsert answer and update attempt stats
    const result = await prisma.$transaction(async (tx) => {
      let savedAnswer;

      if (isStudent) {
        // Find existing student answer
        const existing = await tx.studentAnswer.findFirst({
          where: { attemptId, questionId },
        });

        savedAnswer = await tx.studentAnswer.upsert({
          where: { id: existing?.id || uuidv4() },
          create: {
            id: uuidv4(),
            attemptId,
            questionId,
            answerText: answerText || null,
            selectedOptions: selectedOptions || [],
            isCorrect,
            points,
          },
          update: {
            answerText: answerText || null,
            selectedOptions: selectedOptions || [],
            isCorrect,
            points,
          },
        });
      } else {
        const selectedOptionTexts = question.options
          .filter((opt: any) => selectedOptions?.includes(opt.id))
          .map((opt: any) => opt.option);

        const existing = await tx.answer.findFirst({
          where: { testAttemptId: attemptId, questionId },
        });

        savedAnswer = await tx.answer.upsert({
          where: { id: existing?.id || uuidv4() },
          create: {
            id: uuidv4(),
            testAttemptId: attemptId,
            questionId,
            answerText: answerText || null,
            selectedOptions: selectedOptions || [],
            userAnswer: selectedOptionTexts || [],
            isCorrect,
            points,
          },
          update: {
            answerText: answerText || null,
            selectedOptions: selectedOptions || [],
            userAnswer: selectedOptionTexts || [],
            isCorrect,
            points,
          },
        });
      }

      // Update test attempt stats
      const allAnswers = isStudent
        ? await tx.studentAnswer.findMany({ where: { attemptId } })
        : await tx.answer.findMany({ where: { testAttemptId: attemptId } });

      const correctAnswersCount = allAnswers.filter((a: any) => a.isCorrect).length;
      const totalEarnedPoints = allAnswers.reduce((sum: number, a: any) => sum + (a.points || 0), 0);

      const updateData = {
        correctAnswers: correctAnswersCount,
        score: (totalEarnedPoints / testAttempt.totalQuestions) * 100,
      };

      if (isStudent) {
        await tx.studentTestAttempt.update({
          where: { id: attemptId },
          data: updateData,
        });
      } else {
        await tx.testAttempt.update({
          where: { id: attemptId },
          data: updateData,
        });
      }

      return { savedAnswer, correctAnswersCount, totalAnswered: allAnswers.length };
    });

    res.status(200).json({
      status: "success",
      data: {
        answer: result.savedAnswer,
        isCorrect,
        points,
        correctAnswers: result.correctAnswersCount,
        totalAnswered: result.totalAnswered,
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
    // @ts-ignore
    const userRole = req.user?.role;
    // @ts-ignore
    const studentId = req.studentId;

    const isStudent = userRole === "STUDENT";

    // 1. Validate test attempt
    let testAttempt: any;
    if (isStudent) {
      testAttempt = await prisma.studentTestAttempt.findFirst({
        where: { id: attemptId, studentId: (userRole as any) === 'SUPER_ADMIN' ? undefined : studentId },
        include: {
          test: {
            include: {
              course: {
                include: { instructor: true },
              },
              questions: {
                include: { options: true },
              },
            },
          },
          student: true,
          answers: {
            include: { question: true },
          },
        },
      });
    } else {
      testAttempt = await prisma.testAttempt.findFirst({
        where: { id: attemptId, userId: (userRole as any) === 'SUPER_ADMIN' ? undefined : userId },
        include: {
          test: {
            include: {
              course: {
                include: { instructor: true },
              },
              questions: {
                include: { options: true },
              },
            },
          },
          user: true,
          answers: {
            include: { question: true },
          },
        },
      });
    }

    if (!testAttempt) {
      throw new NotFoundError("Test attempt not found");
    }

    // 2. Calculate final score
    const questions = await prisma.question.findMany({
      where: { testId: testAttempt.testId },
    });

    const totalScoreForQuestions = questions.reduce(
      (sum, q) => sum + (q.points || 0),
      0
    );
    const totalQuestions = questions.length;
    const answeredQuestions = testAttempt.answers.length;
    const correctAnswers = testAttempt.answers.filter(
      (a: any) => a.isCorrect
    ).length;
    const totalPoints = testAttempt.answers.reduce(
      (sum: number, a: any) => sum + (a.points || 0),
      0
    );
    const score = (totalPoints / totalScoreForQuestions) * 100;
    const isPassed = score >= testAttempt.test.passingScore;

    // 3. Update test attempt
    const now = new Date();
    const updateData: any = {
      endTime: now,
      score,
      isPassed,
      status: "COMPLETED",
      timeSpent: Math.floor(
        (now.getTime() - testAttempt.startTime.getTime()) / 1000 / 60
      ), // in minutes
    };

    if (isStudent) {
      await prisma.studentTestAttempt.update({
        where: { id: attemptId },
        data: updateData,
      });
    } else {
      await prisma.testAttempt.update({
        where: { id: attemptId },
        data: updateData,
      });
    }

    // 4. Update user progress
    if (isPassed && !isStudent) {
      await updateUserProgress(
        userId,
        testAttempt.test.courseId,
        testAttempt.testId
      );
    }

    // 5. Send email notification for INTERVIEW and OPENENDED tests
    if (testAttempt.test.type === "INTERVIEW" || testAttempt.test.type === "OPENENDED") {
      await sendTestResponseEmailNotification(
        testAttempt,
        isStudent ? studentId : userId,
        isStudent
      );
    }

    // 6. Generate results
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
        timeSpent: updateData.timeSpent,
        submittedAt: now.toISOString(),
      },
      message: "Test submitted successfully",
    };

    // 7. Include detailed results if showResults is enabled
    if (testAttempt.test.showResults) {
      const detailedAnswers = isStudent
        ? await prisma.studentAnswer.findMany({
          where: { attemptId },
          include: {
            question: {
              include: {
                options: {
                  where: { isCorrect: true },
                  select: { id: true, option: true },
                },
              },
            },
          },
        })
        : await prisma.answer.findMany({
          where: { testAttemptId: attemptId },
          include: {
            question: {
              include: {
                options: {
                  where: { isCorrect: true },
                  select: { id: true, option: true },
                },
              },
            },
          },
        });

      response.data.details = detailedAnswers.map((a: any) => ({
        questionId: a.questionId,
        question: a.question.question,
        type: a.question.type,
        isCorrect: a.isCorrect,
        points: a.points,
        userAnswer: a.answerText || (isStudent ? a.selectedOptions : a.userAnswer),
        correctAnswers: a.question.options.map((opt: any) => ({
          id: opt.id,
          option: opt.option,
        })),
      }));
    }

    // 8. Send notifications
    await sendTestCompletionNotification(
      isStudent ? studentId : userId,
      testAttempt.test,
      isPassed,
      score,
      isStudent
    );

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
  score: number,
  isStudent: boolean = false
) => {
  try {
    // Send notification to instructor
    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: test.course.instructorId,
        type: "TEST_GRADED",
        title: `${isStudent ? "Student" : "User"} completed test "${test.title}"`,
        message: `A ${isStudent ? "student" : "user"} has completed the test with ${score.toFixed(2)}%`,
        metadata: {
          testId: test.id,
          [isStudent ? 'studentId' : 'userId']: userId,
          score,
          passed: isPassed,
          timestamp: new Date().toISOString(),
          isStudent
        },
      },
    });

    // Send notification to instructor if explicitly needed (original logic)
    if (test.notifyInstructor) {
      await prisma.notification.create({
        data: {
          id: uuidv4(),
          userId: test.course.instructorId,
          type: "TEST_GRADED",
          title: `${isStudent ? "Student" : "User"} completed test "${test.title}"`,
          message: `A ${isStudent ? "student" : "user"} has completed the test with ${score.toFixed(2)}%`,
          metadata: {
            testId: test.id,
            [isStudent ? 'studentId' : 'userId']: userId,
            score,
            passed: isPassed,
            timestamp: new Date().toISOString(),
            isStudent
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
  actorId: string,
  isStudent: boolean = false
) => {
  try {
    const instructor = testAttempt.test.course.instructor;
    const actor = isStudent ? testAttempt.student : testAttempt.user;

    if (!instructor || !instructor.email) {
      logger.warn(`No instructor email found for test ${testAttempt.test.title}`);
      return;
    }

    // Get all answers with questions
    const answersWithQuestions = isStudent
      ? await prisma.studentAnswer.findMany({
        where: { attemptId: testAttempt.id },
        include: { question: true },
        orderBy: { question: { order: 'asc' } },
      })
      : await prisma.answer.findMany({
        where: { testAttemptId: testAttempt.id },
        include: { question: true },
        orderBy: { question: { order: 'asc' } },
      });

    // Format questions and responses for email
    const questions = answersWithQuestions.map((answer: any) => ({
      question: answer.question.question,
      image: answer.question.image || undefined,
      studentAnswer: answer.answerText || (isStudent ? answer.selectedOptions.join(", ") : (answer.userAnswer?.join(", ") || "No response provided")),
      solution: answer.question.explanation || undefined,
      explanation: answer.question.explanation || undefined,
    }));

    // Send email
    await sendTestResponseEmail({
      instructorEmail: instructor.email,
      studentName: `${actor.firstName} ${actor.lastName}`,
      studentEmail: actor.email,
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
      status: "success",
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
      status: "success",
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
      status: "success",
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
      status: "success",
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
      status: "success",
      message: `${created.length} questions uploaded successfully`,
      data: created,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
