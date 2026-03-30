import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * POST /api/onboarding/role
 * Body: { role: 'LABORER' | 'CONTRACTOR' | 'PROPERTY_OWNER' }
 *
 * Sets the user's role. Called after role selection screen.
 */
export async function setRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { role } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validRoles = ['LABORER', 'CONTRACTOR', 'PROPERTY_OWNER'];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be LABORER, CONTRACTOR, or PROPERTY_OWNER.' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.status(200).json({
      message: 'Role updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/onboarding/laborer
 * Body: { type, trade, hourlyRate, experience, phone, state, city, skills, bio }
 *
 * Creates the laborer profile and marks onboarding as complete.
 */
export async function completeLaborerOnboarding(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, trade, hourlyRate, experience, phone, state, city, skills, bio } = req.body;

    // Validate required fields
    if (!type || !trade || !hourlyRate || !experience || !phone || !state || !city) {
      res.status(400).json({
        error: 'Missing required fields: type, trade, hourlyRate, experience, phone, state, city',
      });
      return;
    }

    const validTypes = ['SKILLED', 'UNSKILLED'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid type. Must be SKILLED or UNSKILLED.' });
      return;
    }

    // Check user exists and has LABORER role
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'LABORER') {
      res.status(400).json({ error: 'User role must be LABORER to complete laborer onboarding.' });
      return;
    }

    // Upsert the laborer profile (in case they re-do onboarding)
    const laborerProfile = await prisma.laborerProfile.upsert({
      where: { userId },
      create: {
        userId,
        type,
        trade,
        hourlyRate: parseFloat(hourlyRate),
        experience: String(experience),
        state,
        city,
        skills: skills || [],
        bio: bio || null,
      },
      update: {
        type,
        trade,
        hourlyRate: parseFloat(hourlyRate),
        experience: String(experience),
        state,
        city,
        skills: skills || [],
        bio: bio || null,
      },
    });

    // Update phone number and mark onboarding complete
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: phone,
        onboardingComplete: true,
      },
    });

    res.status(200).json({
      message: 'Laborer onboarding completed successfully',
      profile: laborerProfile,
    });
  } catch (error: any) {
    console.error('Laborer onboarding error:', error);

    // Handle unique constraint violations (e.g., duplicate phone number)
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Phone number is already registered to another account.' });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
