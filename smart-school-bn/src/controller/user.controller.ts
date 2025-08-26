import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { comparePassword, hashPassword } from "../utils/hashPassword";
import { sendSmsTo } from "../utils/sendSms";
import { sendEmail } from "../utils/sendEmail";
import { generateToken, refreshToken } from "../utils/tokens";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: startIndex,
      include: {
        courses: true,
        enrollments: true,
        reviews: true,
        testAttempts: true,
        certificates: true,
        userProgress: true,
      },
    });

    const paginatedUsers = users.slice(startIndex, endIndex);
    const total = users.length;
    const totalPages = Math.ceil(total / limit);

    logger.info("Users retrieved successfully", {
      page,
      limit,
      total,
      resultCount: paginatedUsers.length,
    });

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        courses: true,
        enrollments: true,
        reviews: true,
        testAttempts: true,
        certificates: true,
        userProgress: true,
      },
    });

    if (!user) {
      logger.warn("User not found", { userId: id });
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // @ts-ignore
    const id = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        courses: true,
        enrollments: true,
        reviews: true,
        testAttempts: true,
        certificates: true,
        userProgress: true,
      },
    });

    if (!user) {
      logger.warn("User not found", { userId: id });
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData = req.body;
    if (userData.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingEmail) {
        res.status(409).json({
          status: "error",
          message: "User with this email already exists",
        });
        return;
      }
    }

    if (userData.phoneNumber) {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: userData.phoneNumber },
      });
      if (existingPhone) {
        res.status(409).json({
          status: "error",
          message: "User with this phone number already exists",
        });
        return;
      }
    }

    if (userData.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: userData.username },
      });
      if (existingUsername) {
        res.status(409).json({
          status: "error",
          message: "User with this username already exists",
        });
        return;
      }
    }

    const hashedPassword = await hashPassword(userData.password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    if (userData.email) {
      await sendEmail({
        to: userData.email,
        subject: "Verification Code",
        text: `Here is your verification code: ${verificationCode}`,
        html: `<p>Hello ${userData.username}, Thank you for signing up to Smart School</p>
               <p>You can verify your account with this code:</p>
               <h2>${verificationCode}</h2>
               <p>Best regards, </p>
               <p>Smart School Team</p>`,
      });
    } else if (userData.phoneNumber) {
      await sendSmsTo(
        userData.phoneNumber,
        `Your verification code is ${verificationCode}. Thank you for signing up to Smart School`
      );
    }
    const newUser: User = await prisma.user.create({
      data: { 
        id: uuidv4(),
        ...userData,
        password: hashedPassword,
        verificationCode
      },
    });

    const { password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: "success",
      message: "User created successfully. Please verify your account.",
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { verificationCode } = req.body;
    const user = await prisma.user.findFirst({
      where: { verificationCode },
    });
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "Invalid verification code. Check your email or phone number for verification code.",
      });
      return;
    }
    user.isVerified = true;
    await prisma.user.update({
      where: { id: user.id },
      data: user,
    });
    res.status(200).json({
      status: "success",
      message: "User verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.identifier },
          { phoneNumber: userData.identifier },
        ],
      },
    });
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "Invalid credentials",
      });
      return;
    }
    if (!user.isActive) {
      res.status(401).json({
        status: "error",
        message: "Your account is not active. Please contact the admin for assistance.",
      });
      return;
    }
    if(!user.isVerified) {
      res.status(401).json({
        status: "error",
        message: "Your account is not verified.Check your email or phone number for verification code.",
      });
      return;
    }
    const isPasswordValid = await comparePassword(userData.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
      return;
    }
    const token = generateToken(user);
    const { password, verificationCode, ...userWithoutPassword } = user;
    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        accessToken: token,
        refreshToken: refreshToken(user),
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneNumber: identifier },
        ],
      },
    });
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }
    const resetPasswordToken = jwt.sign({
      userId: user.id,
    }, process.env.JWT_SECRET as string, { expiresIn: "20m" });
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken,
        resetPasswordExpires: new Date(Date.now() + 20 * 60 * 1000)
       },
    });
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Reset Password",
        text: `Here is your reset password token: ${resetPasswordToken}`,
        html: `<p>Hello ${user.username},</p>
                <p>We are here to help you reset your password.</p>
                <p>Click on the link below to reset your password:</p>
                <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}">Reset Password</a>
                <p>Or copy and paste the link below :</p>
                <p>${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}</p>
                <p>This link will expire in 20 minutes.Make sure to use it within that time.</p>
                <p>Best regards, </p>
                <p>Smart School Team</p>`,
      });
    } else if (user.phoneNumber) {
      await sendSmsTo(
        user.phoneNumber,
        `Your reset password link is ${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}. 
        This link will expire in 20 minutes.Make sure to use it within that time. 
        Thank you for signing up to Smart School`
      );
    }
    res.status(200).json({
      status: "success",
      message: "Reset password token sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password, confirmPassword } = req.body;
    const token = req.query.token as string;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "Invalid reset token",
      });
      return;
    }
    if ( user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      res.status(401).json({
        status: "error",
        message: "Reset token has expired",
      });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({
        status: "error",
        message: "Passwords do not match",
      });
      return;
    }
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await prisma.user.update({
      where: { id: user.id },
      data: user,
    });
    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};




// export const updateUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const id = parseInt(req.params.id);
//     const { name, email } = req.body;

//     const userIndex = users.findIndex((u) => u.id === id);
//     if (userIndex === -1) {
//       logger.warn("User update failed - user not found", { userId: id });
//       res.status(404).json({
//         status: "error",
//         message: "User not found",
//         timestamp: new Date().toISOString(),
//       });
//       return;
//     }

//     // Update user
//     users[userIndex] = {
//       ...users[userIndex],
//       ...(name && { name }),
//       ...(email && { email }),
//       updatedAt: new Date(),
//     };

//     logger.info("User updated successfully", { userId: id });

//     res.status(200).json({
//       status: "success",
//       message: "User updated successfully",
//       data: users[userIndex],
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @swagger
//  * /api/users/{id}:
//  *   delete:
//  *     summary: Delete user by ID
//  *     tags: [Users]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: User ID
//  *     responses:
//  *       200:
//  *         description: User deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Success'
//  *       404:
//  *         description: User not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  */
// export const deleteUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const id = parseInt(req.params.id);
//     const userIndex = users.findIndex((u) => u.id === id);

//     if (userIndex === -1) {
//       logger.warn("User deletion failed - user not found", { userId: id });
//       res.status(404).json({
//         status: "error",
//         message: "User not found",
//         timestamp: new Date().toISOString(),
//       });
//       return;
//     }

//     // Delete user
//     users.splice(userIndex, 1);

//     logger.info("User deleted successfully", { userId: id });

//     res.status(200).json({
//       status: "success",
//       message: "User deleted successfully",
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     next(error);
//   }
// };
