import { Router } from 'express';
import {
    recordMarks,
    getResultsByClass
} from '../controller/result.controller';
import { authenticate, authorize } from '../middleware/auth';
import { tenantContext, requireTenant } from '../middleware/tenant.middleware';

const router = Router();

router.use(authenticate, tenantContext, requireTenant);

router.post('/record', authorize('ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN'), recordMarks);
router.get('/class-results', getResultsByClass);

export default router;
