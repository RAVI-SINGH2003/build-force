import { Router } from 'express';
import { googleSignIn, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/google — Verify Google ID token and return JWT
router.post('/google', googleSignIn);

// GET /api/auth/me — Get current authenticated user
router.get('/me', authenticateToken, getMe);

export default router;
