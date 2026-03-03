import { User as CustomUser } from './index';

declare global {
    namespace Express {
        interface User extends CustomUser { }
        interface Request {
            user?: CustomUser;
            student?: any;
            studentId?: string;
            schoolId?: string;
            rawBody?: Buffer;
        }
    }
}

export { }; // Ensure it's treated as a module
