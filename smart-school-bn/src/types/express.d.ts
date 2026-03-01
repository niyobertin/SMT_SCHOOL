import { ExamAttempt } from '@prisma/client';

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'SELF_STUDENT' | 'EXAMINER' | 'USER';

interface UnifiedUser {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string | null;
    isActive: boolean;
    userOrganizations?: Array<{
        organizationId: string;
        organization: {
            id: string;
            name: string;
        };
    }>;
}

declare global {
    namespace Express {
        interface User extends UnifiedUser { }
        interface Request {
            user?: UnifiedUser;
            candidate?: {
                id: string;
                candidateId: string;
                firstName: string;
                lastName: string;
                email: string | null;
                isActive: boolean;
                organizationId: string;
            };
            organizationId?: string;
            examId?: string;
            examAttempt?: ExamAttempt;
        }
    }
}

export { };
