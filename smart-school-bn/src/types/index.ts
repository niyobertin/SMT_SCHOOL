type UserRole = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT" | "SELF_STUDENT" | "EXAMINER" | "USER";

export interface User {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  avatar?: string | null;
  isActive: boolean;
  isVerified: boolean;
  verificationCode?: number | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
  userOrganizations?: Array<{
    organizationId: string;
    organization: {
      id: string;
      name: string;
    };
  }>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
