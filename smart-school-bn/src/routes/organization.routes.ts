import express from 'express';
import { authenticate } from '../middleware/auth';
import { forAdmin, forExamStaff } from '../middleware/rbac';
import { tenantContext } from '../middleware/tenant.middleware';
import { catchAsync } from '../utils/errors';
import { upload } from '../middleware/uploadFile';
import {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    uploadOrganizationLogo,
} from '../controller/organization.controller';

const router = express.Router();

/**
 * Organization routes — mounted at /organizations.
 *
 * Previously these lived under /exams/organizations (exam.routes.ts).
 * That path now proxies here for backward compatibility (Phase 1).
 * The /exams/organizations alias will be removed in Phase 3.
 */
router.post('/', authenticate, forAdmin, tenantContext, catchAsync(createOrganization));
router.get('/', authenticate, forExamStaff, tenantContext, catchAsync(getOrganizations));
router.get('/:id', authenticate, forExamStaff, tenantContext, catchAsync(getOrganizationById));
router.patch('/:id', authenticate, forAdmin, tenantContext, catchAsync(updateOrganization));
router.delete('/:id', authenticate, forAdmin, tenantContext, catchAsync(deleteOrganization));
router.post(
    '/:id/logo',
    authenticate,
    forAdmin,
    upload.single('logo'),
    catchAsync(uploadOrganizationLogo)
);

export default router;
