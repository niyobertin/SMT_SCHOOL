import { Router } from 'express';
import {
    createGradingPolicy,
    getGradingPolicies,
    updateGradingPolicy,
    deleteGradingPolicy
} from '../controller/grading.controller';
import { authenticate, authorize } from '../middleware/auth';
import { tenantContext, requireTenant } from '../middleware/tenant.middleware';

const router = Router();

router.use(authenticate, tenantContext, requireTenant);

router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createGradingPolicy);
router.get('/', getGradingPolicies);
router.put('/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateGradingPolicy);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteGradingPolicy);

export default router;
