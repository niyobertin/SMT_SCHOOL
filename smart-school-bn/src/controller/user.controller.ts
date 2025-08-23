import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../utils/hashPassword";

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
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData = req.body;
    // Check if user already exists
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
    } else if (userData.phoneNumber) {
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
    } else if (userData.username) {
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
    userData.password = hashedPassword;
    // Create new user
    const newUser: User = await prisma.user.create({
      data: { 
        id: uuidv4(),
        ...userData },
    });
    const newUserWithPassword = {
      ...newUser,
      password: hashedPassword,
    };

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: newUserWithPassword,
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
