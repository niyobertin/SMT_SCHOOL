import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export const generateToken = (user: any): string => {
    return jwt.sign({
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
    }, process.env.JWT_SECRET as string, { expiresIn: '30days' });
}

export const refreshToken = (user: User): string => {
    return jwt.sign({
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
    }, process.env.JWT_SECRET as string, { expiresIn: '30days' });
}