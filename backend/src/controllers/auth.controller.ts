import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const GOOGLE_WEB_CLIENT_ID = '664083031630-7f17tp1fjk78r32570h7i2j9uosf7c56.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_WEB_CLIENT_ID);

/**
 * POST /api/auth/google
 * Body: { idToken: string }
 *
 * Verifies the Google ID token, creates or finds the user,
 * and returns a JWT + user data to the client.
 */
export async function googleSignIn(req: Request, res: Response): Promise<void> {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'idToken is required' });
      return;
    }

    // Verify the Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_WEB_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    if (!payload || !payload.email) {
      res.status(401).json({ error: 'Invalid Google token payload' });
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user or create a new one
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        laborerProfile: true,
        contractorProfile: true,
        propertyOwnerProfile: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: googleId || null,
          email,
          name: name || null,
          photoUrl: picture || null,
        },
        include: {
          laborerProfile: true,
          contractorProfile: true,
          propertyOwnerProfile: true,
        },
      });
      console.log('✅ New user created:', user.id, email);
    } else {
      // Update Google info if missing
      if (!user.googleId && googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            name: user.name || name || null,
            photoUrl: user.photoUrl || picture || null,
          },
          include: {
            laborerProfile: true,
            contractorProfile: true,
            propertyOwnerProfile: true,
          },
        });
      }
      console.log('✅ Existing user found:', user.id, email);
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
        phoneNumber: user.phoneNumber,
        role: user.role,
        onboardingComplete: user.onboardingComplete,
        laborerProfile: user.laborerProfile,
        contractorProfile: user.contractorProfile,
        propertyOwnerProfile: user.propertyOwnerProfile,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

/**
 * GET /api/auth/me
 * Returns the current user's data (requires JWT auth).
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        laborerProfile: true,
        contractorProfile: true,
        propertyOwnerProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
