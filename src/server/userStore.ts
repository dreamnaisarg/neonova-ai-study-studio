import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import defaultUsersData from '../../users_db.json' with { type: 'json' };

export interface UserAccount {
  id: string;
  username: string; // Stored in original casing, indexed normalized
  email: string; // Normalized lowercase
  passwordHash: string; // scrypt cryptographic hash
  passwordSalt: string; // 16-byte random hex salt
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationExpires?: string;
  resetToken?: string;
  resetTokenExpires?: string;
  createdAt: string;
  lastLoginAt?: string;
  grade: string;
  studentName: string;
  studentAvatar: string;
  planTier: 'starter' | 'plus' | 'pro';
  billingCycle?: 'monthly' | 'yearly';
  subscriptionExpires?: string;
  subscriptionStatus?: 'active' | 'expired' | 'none';
  studyXP: number;
  sessionToken?: string;
  sessionExpires?: string;
}

export interface SanitizedUser {
  id: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  grade: string;
  studentName: string;
  studentAvatar: string;
  planTier: 'starter' | 'plus' | 'pro';
  billingCycle?: 'monthly' | 'yearly';
  subscriptionExpires?: string;
  subscriptionStatus?: 'active' | 'expired' | 'none';
  studyXP: number;
  createdAt: string;
  lastLoginAt?: string;
}

const getCwd = () => (typeof process !== 'undefined' && process.cwd ? process.cwd() : '.');
const USERS_FILE = path.join(getCwd(), 'users_db.json');
const USERS_FILE_ALT = path.join(getCwd(), 'users-db.json');

// Memory cache of users synced to disk
let usersCache: UserAccount[] | null = null;

export function logAuthAudit(event: {
  type: 'signup' | 'login' | 'logout' | 'password_reset' | 'verify_email';
  identifier?: string;
  userId?: string;
  success: boolean;
  errorCategory?: string;
  message: string;
}): void {
  const timestamp = new Date().toISOString();
  // Safe logging: Never log passwords, salts, or session tokens
  console.log(`[AUTH ${event.type.toUpperCase()}] ${timestamp} | Success: ${event.success} | User: ${event.userId || event.identifier || 'anonymous'} | Category: ${event.errorCategory || 'none'} | Info: ${event.message}`);
}

function loadUsers(): UserAccount[] {
  if (usersCache) return usersCache;
  const mergedMap = new Map<string, UserAccount>();

  // 0. Seed from bundled users database so existing accounts are ALWAYS available in serverless/worker environments
  try {
    if (Array.isArray(defaultUsersData)) {
      defaultUsersData.forEach((u: any) => {
        if (u && u.id) mergedMap.set(u.id, u as UserAccount);
      });
    }
  } catch (err) {
    console.warn('Failed to seed default users:', err);
  }

  // 1. Try reading primary users_db.json from disk if fs is available (Node.js runtime)
  try {
    if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const list: UserAccount[] = JSON.parse(data);
      if (Array.isArray(list)) {
        list.forEach(u => { if (u && u.id) mergedMap.set(u.id, u); });
      }
    }
  } catch (err) {
    // Disk reading skipped safely in edge/worker environments
  }

  // 2. Try reading alternate users-db.json and merge without losing existing records
  try {
    if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(USERS_FILE_ALT)) {
      const data = fs.readFileSync(USERS_FILE_ALT, 'utf-8');
      const list: UserAccount[] = JSON.parse(data);
      if (Array.isArray(list)) {
        list.forEach(u => {
          if (u && u.id && !mergedMap.has(u.id)) {
            mergedMap.set(u.id, u);
          }
        });
      }
    }
  } catch (err) {
    // Disk reading skipped safely
  }

  usersCache = Array.from(mergedMap.values());
  return usersCache;
}

function saveUsers(): void {
  try {
    if (typeof fs !== 'undefined' && fs.writeFileSync) {
      if (!usersCache) usersCache = [];
      const jsonStr = JSON.stringify(usersCache, null, 2);
      fs.writeFileSync(USERS_FILE, jsonStr, 'utf-8');
      try {
        fs.writeFileSync(USERS_FILE_ALT, jsonStr, 'utf-8');
      } catch {}
    }
  } catch (err) {
    // In serverless / edge runtime where filesystem is read-only, in-memory state remains updated
  }
}

/**
 * Cryptographic Password Hashing using Scrypt and Salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Timing-safe password verification
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    if (typeof crypto.timingSafeEqual === 'function' && typeof Buffer !== 'undefined') {
      const a = Buffer.from(testHash, 'hex');
      const b = Buffer.from(storedHash, 'hex');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    }
    return testHash.toLowerCase() === storedHash.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Strips sensitive password hashes and internal keys from user object
 */
export function sanitizeUser(user: UserAccount): SanitizedUser {
  let currentTier = user.planTier || 'starter';
  let status = user.subscriptionStatus || (currentTier !== 'starter' ? 'active' : 'none');
  if (user.subscriptionExpires) {
    const expTime = new Date(user.subscriptionExpires).getTime();
    if (!isNaN(expTime) && Date.now() > expTime) {
      currentTier = 'starter';
      status = 'expired';
    }
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    grade: user.grade,
    studentName: user.studentName,
    studentAvatar: user.studentAvatar,
    planTier: currentTier,
    billingCycle: user.billingCycle || 'monthly',
    subscriptionExpires: user.subscriptionExpires,
    subscriptionStatus: status,
    studyXP: user.studyXP || 100,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

/**
 * Register a new user
 */
export function registerUser(input: {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  grade?: string;
  studentName?: string;
  studentAvatar?: string;
  planTier?: 'starter' | 'plus' | 'pro';
  billingCycle?: 'monthly' | 'yearly';
  durationMonths?: number;
}): { success: boolean; error?: string; user?: SanitizedUser; token?: string; verificationCode?: string } {
  const users = loadUsers();

  const rawUsername = (input.username || '').trim();
  const rawEmail = (input.email || '').trim().toLowerCase();
  const password = input.password || '';
  const confirmPassword = input.confirmPassword || '';

  // 1. Basic validation
  if (!rawUsername || rawUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(rawUsername)) {
    return { success: false, error: 'Username can only contain letters, numbers, underscores, and hyphens.' };
  }
  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // 2. Password validation
  if (!password || password.length < 8) {
    logAuthAudit({ type: 'signup', identifier: rawEmail, success: false, errorCategory: 'weak_password', message: 'Password is less than 8 characters' });
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }
  if (password !== confirmPassword) {
    logAuthAudit({ type: 'signup', identifier: rawEmail, success: false, errorCategory: 'password_mismatch', message: 'Passwords do not match' });
    return { success: false, error: 'Passwords do not match.' };
  }

  // 3. Unique Username check (case-insensitive)
  const usernameExists = users.some(u => u.username.toLowerCase() === rawUsername.toLowerCase());
  if (usernameExists) {
    logAuthAudit({ type: 'signup', identifier: rawUsername, success: false, errorCategory: 'username_taken', message: 'Username is already taken' });
    return { success: false, error: 'This username is already taken. Please choose another username.' };
  }

  // 4. Unique Email check (normalized)
  const emailExists = users.some(u => u.email.toLowerCase() === rawEmail.toLowerCase());
  if (emailExists) {
    logAuthAudit({ type: 'signup', identifier: rawEmail, success: false, errorCategory: 'email_exists', message: 'Email is already registered' });
    return { success: false, error: 'This email is already registered. Please log in instead.' };
  }

  // 5. Cryptographic hash
  const { hash, salt } = hashPassword(password);

  // 6. Generate 6-digit email verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Generate 1-year persistent session token immediately on registration
  const token = `neo_sess_${crypto.randomBytes(32).toString('hex')}`;
  const sessionExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // Plan Tier duration (monthly = 30 days, yearly = 365 days)
  const chosenTier: 'starter' | 'plus' | 'pro' = (input.planTier === 'plus' || input.planTier === 'pro') ? input.planTier : 'starter';
  const cycle: 'monthly' | 'yearly' = input.billingCycle === 'yearly' ? 'yearly' : 'monthly';
  let subscriptionExpires: string | undefined = undefined;
  let subscriptionStatus: 'active' | 'none' = 'none';

  if (chosenTier !== 'starter') {
    const days = cycle === 'yearly' ? 365 : (input.durationMonths ? input.durationMonths * 30 : 30);
    subscriptionExpires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    subscriptionStatus = 'active';
  }

  const newUser: UserAccount = {
    id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    username: rawUsername,
    email: rawEmail,
    passwordHash: hash,
    passwordSalt: salt,
    isEmailVerified: true, // Immediate verification so student is never locked out
    verificationCode,
    verificationExpires,
    createdAt: new Date().toISOString(),
    grade: input.grade || 'Grade 8',
    studentName: input.studentName || rawUsername,
    studentAvatar: input.studentAvatar || '🎓',
    planTier: chosenTier,
    billingCycle: cycle,
    subscriptionExpires,
    subscriptionStatus,
    sessionToken: token,
    sessionExpires,
    lastLoginAt: new Date().toISOString(),
    studyXP: 100
  };

  users.push(newUser);
  saveUsers();

  logAuthAudit({
    type: 'signup',
    identifier: rawEmail,
    userId: newUser.id,
    success: true,
    message: `Account created successfully for ${rawUsername}`
  });

  return {
    success: true,
    user: sanitizeUser(newUser),
    token,
    verificationCode
  };
}

/**
 * Verify Email with 6-digit code
 */
export function verifyEmail(input: {
  email?: string;
  code?: string;
}): { success: boolean; error?: string; user?: SanitizedUser; token?: string } {
  const users = loadUsers();
  const rawEmail = (input.email || '').trim().toLowerCase();
  const code = (input.code || '').trim();

  if (!rawEmail || !code) {
    return { success: false, error: 'Email and verification code are required.' };
  }

  const user = users.find(u => u.email.toLowerCase() === rawEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  const token = `neo_sess_${crypto.randomBytes(32).toString('hex')}`;
  user.sessionToken = token;
  user.sessionExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  user.lastLoginAt = new Date().toISOString();

  if (user.isEmailVerified) {
    saveUsers();
    return { success: true, user: sanitizeUser(user), token };
  }

  if (!user.verificationCode || user.verificationCode !== code) {
    return { success: false, error: 'Invalid verification code. Please check your code and try again.' };
  }

  if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }

  user.isEmailVerified = true;
  user.verificationCode = undefined;
  user.verificationExpires = undefined;
  saveUsers();

  return { success: true, user: sanitizeUser(user), token };
}

/**
 * Resend verification code
 */
export function resendVerificationCode(input: {
  email?: string;
}): { success: boolean; error?: string; verificationCode?: string } {
  const users = loadUsers();
  const rawEmail = (input.email || '').trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === rawEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  if (user.isEmailVerified) {
    return { success: false, error: 'This email address is already verified.' };
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = newCode;
  user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  saveUsers();

  return { success: true, verificationCode: newCode };
}

/**
 * Login user with username or email + password
 */
export function loginUser(input: {
  identifier?: string;
  password?: string;
}): { success: boolean; error?: string; requiresVerification?: boolean; email?: string; token?: string; user?: SanitizedUser } {
  const users = loadUsers();
  const identifier = (input.identifier || '').trim().toLowerCase();
  const password = input.password || '';

  if (!identifier || !password) {
    logAuthAudit({ type: 'login', identifier, success: false, errorCategory: 'missing_fields', message: 'Missing identifier or password' });
    return { success: false, error: 'Please enter your email and password.' };
  }

  const user = users.find(
    u => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
  );

  if (!user) {
    logAuthAudit({ type: 'login', identifier, success: false, errorCategory: 'account_not_found', message: 'User account not found' });
    return { success: false, error: 'Incorrect email or password.' };
  }

  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    logAuthAudit({ type: 'login', identifier, userId: user.id, success: false, errorCategory: 'invalid_password', message: 'Password hash verification failed' });
    return { success: false, error: 'Incorrect email or password.' };
  }

  // Valid credentials: auto-verify user so student is never locked out of their created profile
  user.isEmailVerified = true;

  // Generate 1-year persistent session token
  const token = `neo_sess_${crypto.randomBytes(32).toString('hex')}`;
  user.sessionToken = token;
  user.sessionExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year session
  user.lastLoginAt = new Date().toISOString();
  saveUsers();

  logAuthAudit({
    type: 'login',
    identifier,
    userId: user.id,
    success: true,
    message: `User ${user.username} successfully authenticated`
  });

  return {
    success: true,
    token,
    user: sanitizeUser(user)
  };
}

/**
 * Get user by session token
 */
export function getUserByToken(token?: string): SanitizedUser | null {
  if (!token) return null;
  const users = loadUsers();
  const user = users.find(u => u.sessionToken === token);
  if (!user) return null;

  if (user.sessionExpires && new Date(user.sessionExpires) < new Date()) {
    return null;
  }
  return sanitizeUser(user);
}

/**
 * Logout
 */
export function logoutUser(token?: string): boolean {
  if (!token) return false;
  const users = loadUsers();
  const user = users.find(u => u.sessionToken === token);
  if (user) {
    user.sessionToken = undefined;
    user.sessionExpires = undefined;
    saveUsers();
    return true;
  }
  return false;
}

/**
 * Forgot Password - initiates password reset
 */
export function forgotPassword(identifier?: string): { success: boolean; message: string; resetCode?: string } {
  const users = loadUsers();
  const raw = (identifier || '').trim().toLowerCase();

  const user = users.find(
    u => u.username.toLowerCase() === raw || u.email.toLowerCase() === raw
  );

  if (!user) {
    // Return success to avoid email harvesting
    return {
      success: true,
      message: 'If an account exists with this email or username, a password reset code has been generated.'
    };
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetToken = resetCode;
  user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  saveUsers();

  return {
    success: true,
    message: 'If an account exists with this email or username, a password reset code has been generated.',
    resetCode
  };
}

/**
 * Reset Password with verified code
 */
export function resetPassword(input: {
  identifier?: string;
  code?: string;
  newPassword?: string;
  confirmPassword?: string;
}): { success: boolean; error?: string } {
  const users = loadUsers();
  const raw = (input.identifier || '').trim().toLowerCase();
  const code = (input.code || '').trim();
  const newPassword = input.newPassword || '';
  const confirmPassword = input.confirmPassword || '';

  if (!raw || !code) {
    return { success: false, error: 'Username/Email and reset code are required.' };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const user = users.find(
    u => u.username.toLowerCase() === raw || u.email.toLowerCase() === raw
  );

  if (!user || !user.resetToken || user.resetToken !== code) {
    return { success: false, error: 'Invalid or expired password reset code.' };
  }

  if (user.resetTokenExpires && new Date(user.resetTokenExpires) < new Date()) {
    return { success: false, error: 'Password reset code has expired. Please request a new one.' };
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.passwordSalt = salt;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  user.sessionToken = undefined; // Force re-login
  saveUsers();

  return { success: true };
}

/**
 * Update user profile (grade, student name, avatar)
 */
export function updateUserProfile(userId: string, updates: {
  studentName?: string;
  studentAvatar?: string;
  grade?: string;
}): { success: boolean; user?: SanitizedUser; error?: string } {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, error: 'User not found.' };

  if (updates.studentName) user.studentName = updates.studentName.trim();
  if (updates.studentAvatar) user.studentAvatar = updates.studentAvatar;
  if (updates.grade) user.grade = updates.grade;
  saveUsers();

  return { success: true, user: sanitizeUser(user) };
}

/**
 * Update user subscription plan tier (monthly or yearly duration)
 */
export function updateUserSubscription(input: {
  userId?: string;
  email?: string;
  token?: string;
  planTier: 'starter' | 'plus' | 'pro';
  billingCycle?: 'monthly' | 'yearly';
  durationMonths?: number;
}): { success: boolean; user?: SanitizedUser; error?: string } {
  const users = loadUsers();
  const user = users.find(u => 
    (input.userId && u.id === input.userId) ||
    (input.token && u.sessionToken === input.token) ||
    (input.email && u.email.toLowerCase() === input.email.toLowerCase())
  );

  if (!user) {
    return { success: false, error: 'User account not found.' };
  }

  user.planTier = input.planTier;
  user.billingCycle = input.billingCycle || 'monthly';
  
  if (input.planTier === 'starter') {
    user.subscriptionStatus = 'none';
    user.subscriptionExpires = undefined;
  } else {
    const cycle = input.billingCycle || 'monthly';
    const durationDays = cycle === 'yearly' ? 365 : (input.durationMonths ? input.durationMonths * 30 : 30);
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    user.subscriptionExpires = expiresAt;
    user.subscriptionStatus = 'active';
  }

  saveUsers();
  return { success: true, user: sanitizeUser(user) };
}

/**
 * Re-sync and restore user account from persistent client credentials
 * Ensures user never loses profile or active tier even if server state resets
 */
export function syncClientUser(clientUser: Partial<SanitizedUser>, token?: string): { success: boolean; user: SanitizedUser; token: string } {
  const users = loadUsers();
  const cleanEmail = (clientUser.email || '').trim().toLowerCase();
  const cleanUsername = (clientUser.username || '').trim();

  let user = users.find(u => 
    (clientUser.id && u.id === clientUser.id) ||
    (cleanEmail && u.email.toLowerCase() === cleanEmail) ||
    (cleanUsername && u.username.toLowerCase() === cleanUsername.toLowerCase())
  );

  const sessionToken = token || user?.sessionToken || `neo_sess_${crypto.randomBytes(32).toString('hex')}`;
  const sessionExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year session

  if (user) {
    user.sessionToken = sessionToken;
    user.sessionExpires = sessionExpires;
    user.lastLoginAt = new Date().toISOString();
    if (clientUser.planTier && clientUser.planTier !== 'starter') {
      user.planTier = clientUser.planTier;
      user.billingCycle = clientUser.billingCycle || user.billingCycle || 'monthly';
      user.subscriptionExpires = clientUser.subscriptionExpires || user.subscriptionExpires || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      user.subscriptionStatus = 'active';
    }
    saveUsers();
    return { success: true, user: sanitizeUser(user), token: sessionToken };
  }

  // Restore user from client backup if lost during server reset
  const { hash, salt } = hashPassword('persisted-session-safe');
  const restoredUser: UserAccount = {
    id: clientUser.id || `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    username: cleanUsername || 'Cadet',
    email: cleanEmail || 'student@neonova.ai',
    passwordHash: hash,
    passwordSalt: salt,
    isEmailVerified: clientUser.isEmailVerified ?? true,
    grade: clientUser.grade || 'Grade 8',
    studentName: clientUser.studentName || cleanUsername || 'Cadet',
    studentAvatar: clientUser.studentAvatar || '🎓',
    planTier: clientUser.planTier || 'starter',
    billingCycle: clientUser.billingCycle || 'monthly',
    subscriptionExpires: clientUser.subscriptionExpires,
    subscriptionStatus: clientUser.subscriptionStatus || (clientUser.planTier && clientUser.planTier !== 'starter' ? 'active' : 'none'),
    studyXP: clientUser.studyXP || 100,
    sessionToken,
    sessionExpires,
    createdAt: clientUser.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  users.push(restoredUser);
  saveUsers();

  return { success: true, user: sanitizeUser(restoredUser), token: sessionToken };
}
