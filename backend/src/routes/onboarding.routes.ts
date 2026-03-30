import { Router } from 'express';
import { setRole, completeLaborerOnboarding } from '../controllers/onboarding.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All onboarding routes require authentication
router.use(authenticateToken);

// POST /api/onboarding/role — Set user role
router.post('/role', setRole);

// POST /api/onboarding/laborer — Complete laborer profile + onboarding
router.post('/laborer', completeLaborerOnboarding);

export default router;
