import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 128 }).notNull().unique(),
  username: varchar('username', { length: 128 }),
  email: varchar('email', { length: 255 }).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  grade: varchar('grade', { length: 50 }).default('Grade 10').notNull(),
  studentName: varchar('student_name', { length: 200 }).default('Student').notNull(),
  studentAvatar: varchar('student_avatar', { length: 255 }).default('🚀').notNull(),
  planTier: varchar('plan_tier', { length: 50 }).default('starter').notNull(),
  studyXp: integer('study_xp').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
});

export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 128 }).notNull().unique(),
  userUid: varchar('user_uid', { length: 128 })
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  grade: varchar('grade', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  messageId: varchar('message_id', { length: 128 }).notNull().unique(),
  sessionId: varchar('session_id', { length: 128 })
    .references(() => chatSessions.sessionId, { onDelete: 'cascade' })
    .notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  imageMime: varchar('image_mime', { length: 100 }),
  imageData: text('image_data'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  transactionId: varchar('transaction_id', { length: 128 }).notNull().unique(),
  userUid: varchar('user_uid', { length: 128 }).references(() => users.uid, {
    onDelete: 'set null',
  }),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  plan: varchar('plan', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const studentProgress = pgTable('student_progress', {
  id: serial('id').primaryKey(),
  userUid: varchar('user_uid', { length: 128 })
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  topic: varchar('topic', { length: 150 }).notNull(),
  masteryScore: integer('mastery_score').default(0).notNull(),
  questionsAttempted: integer('questions_attempted').default(0).notNull(),
  questionsCorrect: integer('questions_correct').default(0).notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
});

export const chemistryExperiments = pgTable('chemistry_experiments', {
  id: serial('id').primaryKey(),
  userUid: varchar('user_uid', { length: 128 })
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  experimentName: varchar('experiment_name', { length: 200 }).notNull(),
  chemicalsMixed: text('chemicals_mixed').notNull(),
  observation: text('observation'),
  equation: text('equation'),
  quizScore: integer('quiz_score').default(100).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  chatSessions: many(chatSessions),
  transactions: many(transactions),
  studentProgress: many(studentProgress),
  chemistryExperiments: many(chemistryExperiments),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userUid],
    references: [users.uid],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.sessionId],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userUid],
    references: [users.uid],
  }),
}));

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  user: one(users, {
    fields: [studentProgress.userUid],
    references: [users.uid],
  }),
}));

export const chemistryExperimentsRelations = relations(chemistryExperiments, ({ one }) => ({
  user: one(users, {
    fields: [chemistryExperiments.userUid],
    references: [users.uid],
  }),
}));
