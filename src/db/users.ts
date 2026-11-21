import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';
import { isComplimentaryProEmail } from '../lib/billing.ts';

export interface UserProfileInput {
  username?: string;
  studentName?: string;
  studentAvatar?: string;
  grade?: string;
  planTier?: string;
  isEmailVerified?: boolean;
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  extra?: UserProfileInput
) {
  try {
    const safeEmail = email || `${uid}@neonovastudy.local`;
    const resolvedPlanTier = isComplimentaryProEmail(safeEmail) ? 'pro' : extra?.planTier;
    const now = new Date();
    const result = await db
      .insert(users)
      .values({
        uid,
        email: safeEmail,
        username: extra?.username || safeEmail.split('@')[0],
        studentName: extra?.studentName || 'Student',
        studentAvatar: extra?.studentAvatar || '🚀',
        grade: extra?.grade || 'Grade 10',
        planTier: resolvedPlanTier || 'starter',
        isEmailVerified: extra?.isEmailVerified ?? false,
        lastLoginAt: now,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: safeEmail,
          lastLoginAt: now,
          ...(extra?.studentName ? { studentName: extra.studentName } : {}),
          ...(extra?.studentAvatar ? { studentAvatar: extra.studentAvatar } : {}),
          ...(extra?.grade ? { grade: extra.grade } : {}),
          ...(resolvedPlanTier ? { planTier: resolvedPlanTier } : {}),
          ...(typeof extra?.isEmailVerified === 'boolean'
            ? { isEmailVerified: extra.isEmailVerified }
            : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to sync user account. Please try again later.', {
      cause: error,
    });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserByUid:', error);
    throw new Error('Failed to load user profile. Please try again later.', {
      cause: error,
    });
  }
}

export async function deleteUserByUid(uid: string) {
  try {
    const deleted = await db.delete(users).where(eq(users.uid, uid)).returning({ uid: users.uid });
    return deleted.length > 0;
  } catch (error) {
    console.error('Database query failed in deleteUserByUid:', error);
    throw new Error('Failed to delete user record. Please try again later.', {
      cause: error,
    });
  }
}
