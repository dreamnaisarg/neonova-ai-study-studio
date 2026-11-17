import { desc, eq, and } from 'drizzle-orm';
import { db } from './index.ts';
import {
  chatMessages,
  chatSessions,
  chemistryExperiments,
  studentProgress,
  transactions,
} from './schema.ts';

export async function getUserChatSessions(userUid: string) {
  try {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userUid, userUid))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(50);
  } catch (error) {
    console.error('Database query failed in getUserChatSessions:', error);
    throw new Error('Failed to load chat history. Please try again later.', {
      cause: error,
    });
  }
}

export async function saveChatSessionWithMessages(params: {
  sessionId: string;
  userUid: string;
  title: string;
  subject: string;
  grade: string;
  messages?: Array<{
    messageId: string;
    role: string;
    content: string;
    imageMime?: string;
    imageData?: string;
  }>;
}) {
  try {
    const now = new Date();
    const [session] = await db
      .insert(chatSessions)
      .values({
        sessionId: params.sessionId,
        userUid: params.userUid,
        title: params.title,
        subject: params.subject,
        grade: params.grade,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: chatSessions.sessionId,
        set: {
          title: params.title,
          subject: params.subject,
          grade: params.grade,
          updatedAt: now,
        },
      })
      .returning();

    if (params.messages && params.messages.length > 0) {
      for (const msg of params.messages) {
        await db
          .insert(chatMessages)
          .values({
            messageId: msg.messageId,
            sessionId: params.sessionId,
            role: msg.role,
            content: msg.content,
            imageMime: msg.imageMime,
            imageData: msg.imageData,
          })
          .onConflictDoNothing({ target: chatMessages.messageId });
      }
    }

    return session;
  } catch (error) {
    console.error('Database query failed in saveChatSessionWithMessages:', error);
    throw new Error('Failed to save chat session. Please try again later.', {
      cause: error,
    });
  }
}

export async function getStudentProgress(userUid: string) {
  try {
    return await db
      .select()
      .from(studentProgress)
      .where(eq(studentProgress.userUid, userUid))
      .orderBy(desc(studentProgress.lastActivityAt));
  } catch (error) {
    console.error('Database query failed in getStudentProgress:', error);
    throw new Error('Failed to load learning progress. Please try again later.', {
      cause: error,
    });
  }
}

export async function upsertStudentProgress(params: {
  userUid: string;
  subject: string;
  topic: string;
  isCorrect: boolean;
}) {
  try {
    const existing = await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userUid, params.userUid),
          eq(studentProgress.subject, params.subject),
          eq(studentProgress.topic, params.topic)
        )
      )
      .limit(1);

    const now = new Date();
    if (existing.length > 0) {
      const row = existing[0];
      const nextAttempted = row.questionsAttempted + 1;
      const nextCorrect = row.questionsCorrect + (params.isCorrect ? 1 : 0);
      const nextScore = Math.round((nextCorrect / nextAttempted) * 100);
      const [updated] = await db
        .update(studentProgress)
        .set({
          questionsAttempted: nextAttempted,
          questionsCorrect: nextCorrect,
          masteryScore: nextScore,
          lastActivityAt: now,
        })
        .where(eq(studentProgress.id, row.id))
        .returning();
      return updated;
    }

    const [inserted] = await db
      .insert(studentProgress)
      .values({
        userUid: params.userUid,
        subject: params.subject,
        topic: params.topic,
        questionsAttempted: 1,
        questionsCorrect: params.isCorrect ? 1 : 0,
        masteryScore: params.isCorrect ? 100 : 0,
        lastActivityAt: now,
      })
      .returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed in upsertStudentProgress:', error);
    throw new Error('Failed to update learning progress. Please try again later.', {
      cause: error,
    });
  }
}

export async function getChemistryExperiments(userUid: string) {
  try {
    return await db
      .select()
      .from(chemistryExperiments)
      .where(eq(chemistryExperiments.userUid, userUid))
      .orderBy(desc(chemistryExperiments.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Database query failed in getChemistryExperiments:', error);
    throw new Error('Failed to load chemistry lab records. Please try again later.', {
      cause: error,
    });
  }
}

export async function saveChemistryExperiment(params: {
  userUid: string;
  experimentName: string;
  chemicalsMixed: string;
  observation?: string;
  equation?: string;
  quizScore?: number;
}) {
  try {
    const [inserted] = await db
      .insert(chemistryExperiments)
      .values({
        userUid: params.userUid,
        experimentName: params.experimentName,
        chemicalsMixed: params.chemicalsMixed,
        observation: params.observation,
        equation: params.equation,
        quizScore: params.quizScore ?? 100,
      })
      .returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed in saveChemistryExperiment:', error);
    throw new Error('Failed to save lab experiment. Please try again later.', {
      cause: error,
    });
  }
}

export async function getUserTransactionsSql(userUid: string) {
  try {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userUid, userUid))
      .orderBy(desc(transactions.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Database query failed in getUserTransactionsSql:', error);
    throw new Error('Failed to load transactions. Please try again later.', {
      cause: error,
    });
  }
}
