import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail, getUserById } from '../models/user.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

export const SignupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().optional(),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export async function signup(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, name } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await createUser(email, passwordHash, name);
    const token = generateToken({ id: user.id, email: user.email });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, email: user.email });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Me controller error:', error);
    return res.status(500).json({ error: 'Failed to retrieve profile details' });
  }
}
