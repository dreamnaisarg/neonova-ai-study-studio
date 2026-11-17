import { Router, type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.ts';
import { adminAuth } from '../lib/firebase-admin.ts';
import { deleteUserByUid, getOrCreateUser } from '../db/users.ts';
import {
  getChemistryExperiments,
  getStudentProgress,
  getUserChatSessions,
  saveChatSessionWithMessages,
  saveChemistryExperiment,
  upsertStudentProgress,
} from '../db/studyStore.ts';

export const sqlRouter = Router();

sqlRouter.use(requireAuth);

sqlRouter.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await getOrCreateUser(req.user.uid, req.user.email || '', {
      studentName: req.user.name,
      studentAvatar: req.user.picture,
      isEmailVerified: req.user.email_verified,
    });
    const [chats, progress, experiments] = await Promise.all([
      getUserChatSessions(req.user.uid),
      getStudentProgress(req.user.uid),
      getChemistryExperiments(req.user.uid),
    ]);
    return res.json({ success: true, user, chats, progress, experiments });
  } catch (error: any) {
    console.error('Failed to fetch user SQL workspace:', error);
    return res.status(500).json({ error: error.message || 'Failed to load profile' });
  }
});

sqlRouter.post('/sync-user', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { grade, studentName, studentAvatar, planTier } = req.body || {};
    const user = await getOrCreateUser(req.user.uid, req.user.email || '', {
      grade,
      studentName: studentName || req.user.name,
      studentAvatar: studentAvatar || req.user.picture,
      planTier,
      isEmailVerified: req.user.email_verified,
    });
    return res.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to sync user to SQL:', error);
    return res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

sqlRouter.get('/chats', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await getOrCreateUser(req.user.uid, req.user.email || '');
    const chats = await getUserChatSessions(req.user.uid);
    return res.json({ success: true, chats });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load chats' });
  }
});

sqlRouter.post('/chats', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { sessionId, title, subject, grade, messages } = req.body || {};
    if (!sessionId || !title) {
      return res.status(400).json({ error: 'sessionId and title are required' });
    }
    await getOrCreateUser(req.user.uid, req.user.email || '');
    const session = await saveChatSessionWithMessages({
      sessionId,
      userUid: req.user.uid,
      title,
      subject: subject || 'General',
      grade: grade || 'Grade 10',
      messages,
    });
    return res.json({ success: true, session });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to save chat session' });
  }
});

sqlRouter.get('/progress', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await getOrCreateUser(req.user.uid, req.user.email || '');
    const progress = await getStudentProgress(req.user.uid);
    return res.json({ success: true, progress });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load progress' });
  }
});

sqlRouter.post('/progress', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { subject, topic, isCorrect } = req.body || {};
    if (!subject || !topic) {
      return res.status(400).json({ error: 'subject and topic are required' });
    }
    await getOrCreateUser(req.user.uid, req.user.email || '');
    const updated = await upsertStudentProgress({
      userUid: req.user.uid,
      subject,
      topic,
      isCorrect: Boolean(isCorrect),
    });
    return res.json({ success: true, progress: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update progress' });
  }
});

sqlRouter.get('/experiments', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await getOrCreateUser(req.user.uid, req.user.email || '');
    const experiments = await getChemistryExperiments(req.user.uid);
    return res.json({ success: true, experiments });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load experiments' });
  }
});

sqlRouter.post('/experiments', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { experimentName, chemicalsMixed, observation, equation, quizScore } = req.body || {};
    if (!experimentName || !chemicalsMixed) {
      return res.status(400).json({ error: 'experimentName and chemicalsMixed are required' });
    }
    await getOrCreateUser(req.user.uid, req.user.email || '');
    const experiment = await saveChemistryExperiment({
      userUid: req.user.uid,
      experimentName,
      chemicalsMixed,
      observation,
      equation,
      quizScore,
    });
    return res.json({ success: true, experiment });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to save experiment' });
  }
});

sqlRouter.post('/delete-account', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const deleted = await deleteUserByUid(req.user.uid);
    return res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Failed to delete user SQL workspace:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete account data' });
  }
});

export async function handleSqlDevRequest(
  url: string,
  method: string,
  authHeader: string | undefined,
  body: any
): Promise<{ status: number; data: any }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { status: 401, data: { error: 'Unauthorized: Missing token' } };
  }

  const token = authHeader.split('Bearer ')[1];
  let decodedUser;
  try {
    decodedUser = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return { status: 401, data: { error: 'Unauthorized: Invalid token' } };
  }

  const subPath = url.split('?')[0].replace(/^\/api\/sql/, '');

  try {
    if (subPath === '/me' && method === 'GET') {
      const user = await getOrCreateUser(decodedUser.uid, decodedUser.email || '', {
        studentName: decodedUser.name,
        studentAvatar: decodedUser.picture,
        isEmailVerified: decodedUser.email_verified,
      });
      const [chats, progress, experiments] = await Promise.all([
        getUserChatSessions(decodedUser.uid),
        getStudentProgress(decodedUser.uid),
        getChemistryExperiments(decodedUser.uid),
      ]);
      return { status: 200, data: { success: true, user, chats, progress, experiments } };
    }

    if (subPath === '/sync-user' && method === 'POST') {
      const { grade, studentName, studentAvatar, planTier } = body || {};
      const user = await getOrCreateUser(decodedUser.uid, decodedUser.email || '', {
        grade,
        studentName: studentName || decodedUser.name,
        studentAvatar: studentAvatar || decodedUser.picture,
        planTier,
        isEmailVerified: decodedUser.email_verified,
      });
      return { status: 200, data: { success: true, user } };
    }

    if (subPath === '/chats' && method === 'GET') {
      await getOrCreateUser(decodedUser.uid, decodedUser.email || '');
      const chats = await getUserChatSessions(decodedUser.uid);
      return { status: 200, data: { success: true, chats } };
    }

    if (subPath === '/chats' && method === 'POST') {
      const { sessionId, title, subject, grade, messages } = body || {};
      if (!sessionId || !title) {
        return { status: 400, data: { error: 'sessionId and title are required' } };
      }
      await getOrCreateUser(decodedUser.uid, decodedUser.email || '');
      const session = await saveChatSessionWithMessages({
        sessionId,
        userUid: decodedUser.uid,
        title,
        subject: subject || 'General',
        grade: grade || 'Grade 10',
        messages,
      });
      return { status: 200, data: { success: true, session } };
    }

    if (subPath === '/progress' && method === 'GET') {
      await getOrCreateUser(decodedUser.uid, decodedUser.email || '');
      const progress = await getStudentProgress(decodedUser.uid);
      return { status: 200, data: { success: true, progress } };
    }

    if (subPath === '/progress' && method === 'POST') {
      const { subject, topic, isCorrect } = body || {};
      if (!subject || !topic) {
        return { status: 400, data: { error: 'subject and topic are required' } };
      }
      await getOrCreateUser(decodedUser.uid, decodedUser.email || '');
      const progress = await upsertStudentProgress({
        userUid: decodedUser.uid,
        subject,
        topic,
        isCorrect: Boolean(isCorrect),
      });
      return { status: 200, data: { success: true, progress } };
    }

    if (subPath === '/experiments' && method === 'GET') {
      await getOrCreateUser(decodedUser.uid, decodedUser.email || '');
      const experiments = await getChemistryExperiments(decodedUser.uid);
      return { status: 200, data: { success: true, experiments } };
    }

    if (subPath === '/experiments' && method === 'POST') {
      const { experimentName, chemicalsMixed, observation, equation, quizScore } = body || {};
      if (!experimentName || !chemicalsMixed) {
        return { status: 400, data: { error: 'experimentName and chemicalsMixed are required' } };
      }
      await getOrCreateUser(decodedUser.uid, decodedUser.email || '');
      const experiment = await saveChemistryExperiment({
        userUid: decodedUser.uid,
        experimentName,
        chemicalsMixed,
        observation,
        equation,
        quizScore,
      });
      return { status: 200, data: { success: true, experiment } };
    }

    if (subPath === '/delete-account' && method === 'POST') {
      const deleted = await deleteUserByUid(decodedUser.uid);
      return { status: 200, data: { success: true, deleted } };
    }

    return { status: 404, data: { error: `Not found: ${url}` } };
  } catch (error: any) {
    console.error('SQL dev request failed:', error);
    return { status: 500, data: { error: error.message || 'Database request failed' } };
  }
}
