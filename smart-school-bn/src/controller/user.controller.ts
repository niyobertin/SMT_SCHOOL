import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { comparePassword, hashPassword } from "../utils/hashPassword";
import { sendSmsTo } from "../utils/sendSms";
import { sendEmail } from "../utils/sendEmail";
import { generateToken, refreshToken } from "../utils/tokens";
import jwt from "jsonwebtoken";
import { logActivity } from "../helper/activitylogs";

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
    const query = req.query.q as string || "";
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: startIndex,
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { phoneNumber: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        enrollments: true,
        testAttempts: true
      },
    });

    const usersWithoutPassword = users.map((user) => ({
      ...user,
      password: undefined,
      verificationCode: undefined,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    }));

    const paginatedUsers = usersWithoutPassword.slice(startIndex, endIndex);
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
        testAttempts: true,
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
      include: {
        enrollments: true,
        testAttempts: true,
        userOrganizations: {
          include: {
            organization: true
          }
        },
        schoolStaff: {
          include: {
            school: true
          }
        }
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

    const userWithoutPassword = {
      ...user,
      password: undefined,
      verificationCode: undefined,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    };

    res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: userWithoutPassword,
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

    // Check if this is an admin creating a user (authenticated request)
    // @ts-ignore
    const isAdminCreation = !!req.user;

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

    // Send appropriate email based on creation type
    if (isAdminCreation && userData.email) {
      // Send welcome email with credentials for admin-created users
      await sendEmail({
        to: userData.email,
        subject: "Welcome to JobExam Rwanda - Your Account is Ready",
        text: `Welcome to JobExam Rwanda! Your account has been created and is ready to use.`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                 <h2 style="color: #1a7ea5;">Welcome to JobExam Rwanda!</h2>
                 <p>Hello ${userData.firstName} ${userData.lastName},</p>
                 <p>Your account has been created by an administrator and is ready to use.</p>
                 
                 <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                   <h3 style="margin-top: 0; color: #333;">Your Login Credentials:</h3>
                   <p><strong>Username:</strong> ${userData.username}</p>
                   <p><strong>Email:</strong> ${userData.email}</p>
                   <p><strong>Password:</strong> ${userData.password}</p>
                 </div>
                 
                 <p style="color: #d9534f;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                 
                 <p>You can login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="color: #1a7ea5;">JobExam Rwanda Login</a></p>
                 
                 <p>Best regards,<br/>JobExam Rwanda Team</p>
               </div>`,
      });
    } else if (!isAdminCreation) {
      // Send verification code for self-registration
      if (userData.email) {
        await sendEmail({
          to: userData.email,
          subject: "Verification Code",
          text: `Here is your verification code: ${verificationCode}`,
          html: `<p>Hello ${userData.username}, Thank you for signing up to JobExam Rwanda</p>
                 <p>You can verify your account with this code:</p>
                 <h2>${verificationCode}</h2>
                 <p>Best regards, </p>
                 <p>JobExam Rwanda Team</p>`,
        });
      } else if (userData.phoneNumber) {
        await sendSmsTo(
          userData.phoneNumber,
          `Your verification code is ${verificationCode}. Thank you for signing up to JobExam Rwanda`
        );
      }
    }

    const newUser: User = await prisma.user.create({
      data: {
        id: uuidv4(),
        ...userData,
        password: hashedPassword,
        verificationCode: isAdminCreation ? null : verificationCode,
        isVerified: isAdminCreation ? true : false, // Auto-verify admin-created users
      },
    });

    // @ts-ignore
    logActivity(isAdminCreation ? req.user.id : newUser.id, "CREATE_USER", isAdminCreation ? `Admin created user ${newUser.username}` : "New user registered", req.ip || "");

    const { password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: "success",
      message: isAdminCreation
        ? "User created successfully. Welcome email sent with login credentials."
        : "User created successfully. Please verify your account.",
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
    logActivity(user.id, "VERIFY_USER", "User account verified", req.ip || "");
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
          { username: userData.identifier },
        ],
      },
      include: {
        userOrganizations: true,
        schoolStaff: true
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
    if (!user.isVerified) {
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
    const { password, verificationCode, resetPasswordToken, resetPasswordExpires, ...userWithoutPassword } = user;
    logActivity(user.id, "LOGIN", "User logged in", req.ip || "");
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
      data: {
        resetPasswordToken,
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
                <p>JobExam Rwanda Team</p>`,
      });
    } else if (user.phoneNumber) {
      await sendSmsTo(
        user.phoneNumber,
        `Your reset password link is ${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}. 
        This link will expire in 20 minutes.Make sure to use it within that time. 
        Thank you for signing up to JobExam Rwanda`
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
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
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
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const updateUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const { currentPassword, password, confirmPassword } = req.body;
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
      return;
    }
    const isNewPasswordValid = await comparePassword(password, user.password);
    if (isNewPasswordValid) {
      res.status(400).json({
        status: "error",
        message: "New password is same as current password",
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
    await prisma.user.update({
      where: { id },
      data: user,
    });
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Password updated successfully",
        text: `Your password has been updated successfully`,
        html: `<p>Hello ${user.username}, Thank you for updating your password</p>
             <p>It is always a good idea to keep your password secure and change it periodically.</p>
             <p>If you did not request this change, please contact us immediately.</p>
             <p>Best regards, </p>
             <p>JobExam Rwanda Team</p>`,
      });
    }
    if (user.phoneNumber) {
      await sendSmsTo(
        user.phoneNumber,
        `Your password has been updated successfully. If you did not request this change, please contact us immediately.`
      );
    }
    logActivity(user.id, "UPDATE_PASSWORD", "User password updated", req.ip || "");
    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const userData = req.body;
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData,
    });
    const { password, verificationCode, resetPasswordToken, resetPasswordExpires, ...userWithoutPassword } = updatedUser;
    logActivity(user.id, "UPDATE_PROFILE", "User profile updated", req.ip || "");
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const callbackUrlHandler = (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: "Authentication failed" });
      return;
    }
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    return;
  } catch (error) {
    console.error("Error in callbackUrlHandler:", error);
    res
      .status(500)
      .json({ message: "Something went wrong during authentication." });
    return;
  }
};

// ============================================
// USER ROLE & ORGANIZATION MANAGEMENT
// ============================================

/**
 * Assign a role to a user (Admin only)
 */
export const assignUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['ADMIN', 'INSTRUCTOR', 'STUDENT', 'EXAMINER'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        status: 'error',
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    // @ts-ignore
    logActivity(req.user.id, 'ASSIGN_ROLE', `Assigned role ${role} to user ${userId}`, req.ip || '');

    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a user to an organization (Admin only)
 */
export const assignUserToOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, organizationId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
      return;
    }

    // Check if assignment already exists
    const existing = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      }
    });

    if (existing) {
      res.status(409).json({
        status: 'error',
        message: 'User is already assigned to this organization'
      });
      return;
    }

    // Create assignment
    const assignment = await prisma.userOrganization.create({
      data: {
        userId,
        organizationId,
        // @ts-ignore
        assignedBy: req.user.id
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // @ts-ignore
    logActivity(req.user.id, 'ASSIGN_ORGANIZATION', `Assigned user ${userId} to organization ${organizationId}`, req.ip || '');

    res.status(201).json({
      status: 'success',
      message: 'User assigned to organization successfully',
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a user from an organization (Admin only)
 */
export const removeUserFromOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, organizationId } = req.params;

    const assignment = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      }
    });

    if (!assignment) {
      res.status(404).json({
        status: 'error',
        message: 'User is not assigned to this organization'
      });
      return;
    }

    await prisma.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      }
    });

    // @ts-ignore
    logActivity(req.user.id, 'REMOVE_ORGANIZATION', `Removed user ${userId} from organization ${organizationId}`, req.ip || '');

    res.status(200).json({
      status: 'success',
      message: 'User removed from organization successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all organizations for a user
 */
export const getUserOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userOrganizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'User organizations retrieved successfully',
      data: {
        userId: user.id,
        username: user.username,
        role: user.role,
        organizations: user.userOrganizations.map(uo => ({
          id: uo.organization.id,
          name: uo.organization.name,
          assignedAt: uo.assignedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all examiners (Admin only)
 */
export const getExaminers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [examiners, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'EXAMINER' },
        include: {
          userOrganizations: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({
        where: { role: 'EXAMINER' }
      })
    ]);

    const examinersData = examiners.map(examiner => ({
      id: examiner.id,
      username: examiner.username,
      firstName: examiner.firstName,
      lastName: examiner.lastName,
      email: examiner.email,
      phoneNumber: examiner.phoneNumber,
      isActive: examiner.isActive,
      createdAt: examiner.createdAt,
      organizations: examiner.userOrganizations.map(uo => ({
        id: uo.organization.id,
        name: uo.organization.name,
        assignedAt: uo.assignedAt
      }))
    }));

    res.status(200).json({
      status: 'success',
      message: 'Examiners retrieved successfully',
      data: {
        examiners: examinersData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign examiner role and organization in one operation (Admin only)
 */
export const assignExaminerRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { organizationIds } = req.body; // Array of organization IDs

    if (!Array.isArray(organizationIds) || organizationIds.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'At least one organization ID is required'
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    // Verify all organizations exist
    const organizations = await prisma.organization.findMany({
      where: {
        id: { in: organizationIds }
      }
    });

    if (organizations.length !== organizationIds.length) {
      res.status(404).json({
        status: 'error',
        message: 'One or more organizations not found'
      });
      return;
    }

    // Update user role to EXAMINER and assign organizations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update role
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: 'EXAMINER' }
      });

      // Remove existing organization assignments
      await tx.userOrganization.deleteMany({
        where: { userId }
      });

      // Create new organization assignments
      const assignments = await tx.userOrganization.createMany({
        data: organizationIds.map(orgId => ({
          userId,
          organizationId: orgId,
          // @ts-ignore
          assignedBy: req.user.id
        }))
      });

      return { updatedUser, assignments };
    });

    // @ts-ignore
    logActivity(req.user.id, 'ASSIGN_EXAMINER_ROLE', `Assigned EXAMINER role to user ${userId} with ${organizationIds.length} organization(s)`, req.ip || '');

    res.status(200).json({
      status: 'success',
      message: 'Examiner role assigned successfully',
      data: {
        userId: result.updatedUser.id,
        username: result.updatedUser.username,
        role: result.updatedUser.role,
        organizationsAssigned: organizationIds.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update examiner's organization assignments (Admin only)
 */
export const updateExaminerOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { organizationIds } = req.body; // Array of organization IDs

    if (!Array.isArray(organizationIds)) {
      res.status(400).json({
        status: 'error',
        message: 'organizationIds must be an array'
      });
      return;
    }

    // Check if user exists and is an examiner
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    if (user.role !== 'EXAMINER') {
      res.status(400).json({
        status: 'error',
        message: 'User is not an examiner'
      });
      return;
    }

    // Verify all organizations exist
    if (organizationIds.length > 0) {
      const organizations = await prisma.organization.findMany({
        where: {
          id: { in: organizationIds }
        }
      });

      if (organizations.length !== organizationIds.length) {
        res.status(404).json({
          status: 'error',
          message: 'One or more organizations not found'
        });
        return;
      }
    }

    // Update organization assignments in a transaction
    await prisma.$transaction(async (tx) => {
      // Remove existing assignments
      await tx.userOrganization.deleteMany({
        where: { userId }
      });

      // Create new assignments if any
      if (organizationIds.length > 0) {
        await tx.userOrganization.createMany({
          data: organizationIds.map(orgId => ({
            userId,
            organizationId: orgId,
            // @ts-ignore
            assignedBy: req.user.id
          }))
        });
      }
    });

    // @ts-ignore
    logActivity(req.user.id, 'UPDATE_EXAMINER_ORGS', `Updated organization assignments for examiner ${userId}`, req.ip || '');

    res.status(200).json({
      status: 'success',
      message: 'Examiner organizations updated successfully',
      data: {
        userId,
        organizationsAssigned: organizationIds.length
      }
    });
  } catch (error) {
    next(error);
  }
};