type UserRole = "admin" | "user" | "guest";
export interface User {
  email: string;
  phoneNumber: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
