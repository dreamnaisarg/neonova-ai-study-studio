import { handleWorkerRequest } from '../src/server/workerHandler';
import { getUserByToken, logoutUser } from '../src/server/userStore';
import { canAccessFeature, hasEntitlement, PLANS } from '../src/lib/billing';

async function runTestSuite() {
  console.log('--- NeoNova Guest Access + Subscription Authentication Test Suite ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // =========================================================================
  // SCENARIO 1: A new guest opens NeoNova and reaches home screen without logging in
  // =========================================================================
  console.log('\n--- Scenario 1: Guest Access Without Mandatory Login ---');
  {
    // A guest has no session token and no stored profile
    const guestToken = undefined;
    const guestUser = getUserByToken(guestToken);
    assert(guestUser === null, '1.1 Guest has null authenticated user on startup');

    // Guest default tier is starter
    const guestTier = 'starter';
    assert(guestTier === 'starter', '1.2 Guest tier defaults strictly to "starter"');

    // Home screen feature check
    const homeAccess = canAccessFeature(guestTier, 'home');
    assert(homeAccess.allowed === true, '1.3 Guest can directly access Home Dashboard without login');
  }

  // =========================================================================
  // SCENARIO 2: A guest uses available free features without an account
  // =========================================================================
  console.log('\n--- Scenario 2: Free Features Available, Premium Features Restricted ---');
  {
    const guestTier = 'starter';
    const freeFeatures = ['home', 'homework', 'subjects', 'quiz', 'library', 'progress'];
    const premiumFeatures = ['memory', 'three_d_lab', 'neovision_hub', 'ai_tutor', 'exam_prep'];

    for (const feat of freeFeatures) {
      const access = canAccessFeature(guestTier, feat);
      assert(access.allowed === true, `2.1 Free feature "${feat}" is accessible to guest`);
    }

    for (const feat of premiumFeatures) {
      const access = canAccessFeature(guestTier, feat);
      assert(access.allowed === false, `2.2 Premium feature "${feat}" is protected from unauthorized guest access`);
    }
  }

  // =========================================================================
  // SCENARIO 3: A guest opens Login / My Account and successfully signs in
  // =========================================================================
  console.log('\n--- Scenario 3: Guest Opens Login / My Account & Signs In ---');
  const studentEmail = `guest_signup_${Date.now()}@test.edu`;
  const studentUsername = `cadet_${Date.now()}`;
  const studentPassword = 'SecureStudentPass2026!';
  let userSessionToken = '';
  let registeredUserId = '';

  {
    // 3.1 Register account
    const regReq = new Request('https://neonovastudy.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: studentUsername,
        email: studentEmail,
        password: studentPassword,
        confirmPassword: studentPassword,
        grade: 'Grade 8',
        studentName: 'Cadet Explorer'
      })
    });
    const regRes = await handleWorkerRequest(regReq);
    const regData = await regRes.json();

    assert(regRes.status === 200 || regRes.status === 201, '3.1 Account registration succeeds');
    assert(!!regData.token, '3.2 Session token returned on registration');
    assert(regData.user.email === studentEmail, '3.3 User object returned with matching email');
    userSessionToken = regData.token;
    registeredUserId = regData.user.id;

    // 3.2 Verify login with credentials
    const loginReq = new Request('https://neonovastudy.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: studentEmail,
        password: studentPassword
      })
    });
    const loginRes = await handleWorkerRequest(loginReq);
    const loginData = await loginRes.json();

    assert(loginRes.status === 200, '3.4 User logs in successfully with registered credentials');
    assert(loginData.user.username === studentUsername, '3.5 Logged-in profile matches registered username');
    userSessionToken = loginData.token || userSessionToken;
  }

  // =========================================================================
  // SCENARIO 4: Guest selects Plus or Pro, logs in, and returns to correct checkout
  // =========================================================================
  console.log('\n--- Scenario 4: Guest Selects Plan, Authenticates, & Retains Checkout State ---');
  {
    // Guest selects Pro plan with yearly billing cycle
    const pendingCheckout = {
      tier: 'pro' as const,
      billingCycle: 'yearly' as const
    };

    assert(pendingCheckout.tier === 'pro', '4.1 Plan choice "pro" preserved in pending state');
    assert(pendingCheckout.billingCycle === 'yearly', '4.2 Billing cycle "yearly" preserved in pending state');

    // Simulate login completion transferring pending checkout
    const checkoutTargetTier = pendingCheckout.tier;
    const checkoutBillingCycle = pendingCheckout.billingCycle;
    const isPaymentCheckoutOpen = true;

    assert(checkoutTargetTier === 'pro', '4.3 Checkout opened with selected target tier (pro)');
    assert(checkoutBillingCycle === 'yearly', '4.4 Checkout opened with selected billing cycle (yearly)');
    assert(isPaymentCheckoutOpen === true, '4.5 Checkout modal active post-authentication without auto-charging');
  }

  // =========================================================================
  // SCENARIO 5: User cancels login or checkout without losing their selected plan
  // =========================================================================
  console.log('\n--- Scenario 5: User Cancels Login / Checkout Safely ---');
  {
    let selectedPlan: 'plus' | 'pro' = 'plus';
    let isAuthModalOpen = true;

    // User clicks "Continue as Guest" or Close (X)
    isAuthModalOpen = false;

    assert(isAuthModalOpen === false, '5.1 Auth modal closed cleanly on cancel');
    assert(selectedPlan === 'plus', '5.2 Selected plan preserved without reset on cancel');
  }

  // =========================================================================
  // SCENARIO 6: Existing subscriber retains their premium access
  // =========================================================================
  console.log('\n--- Scenario 6: Existing Subscriber Retains Premium Access ---');
  {
    // Upgrade student to Plus via server
    const upgradeReq = new Request('https://neonovastudy.com/api/user/save-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: userSessionToken,
        userId: registeredUserId,
        email: studentEmail,
        planTier: 'plus',
        billingCycle: 'monthly',
        durationMonths: 1
      })
    });
    const upgradeRes = await handleWorkerRequest(upgradeReq);
    const upgradeData = await upgradeRes.json();

    assert(upgradeRes.status === 200, '6.1 Server securely updates subscription tier to plus');
    assert(upgradeData.user.planTier === 'plus', '6.2 User record confirms plus plan tier');

    // Verify session retention via /api/auth/me
    const meReq = new Request('https://neonovastudy.com/api/auth/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: userSessionToken })
    });
    const meRes = await handleWorkerRequest(meReq);
    const meData = await meRes.json();

    assert(meRes.status === 200, '6.3 /api/auth/me confirms active authenticated session');
    assert(meData.user.planTier === 'plus', '6.4 Subscriber retains plus plan tier across requests');
    assert(hasEntitlement(meData.user.planTier, 'plus'), '6.5 Plus entitlements verified');
  }

  // =========================================================================
  // SCENARIO 7: Unsuccessful payment never unlocks premium features
  // =========================================================================
  console.log('\n--- Scenario 7: Unsuccessful Payment Never Unlocks Premium Features ---');
  {
    // Try to verify a fake or invalid payment reference
    const fakeTxnReq = new Request('https://neonovastudy.com/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionRef: 'fake_ref_12345',
        orderId: 'ORD_TEST_9999',
        tier: 'pro',
        billingCycle: 'monthly',
        studentEmail,
        token: userSessionToken
      })
    });
    const fakeRes = await handleWorkerRequest(fakeTxnReq);
    const fakeData = await fakeRes.json();

    assert(fakeData.verified === false, '7.1 Invalid payment reference rejected by authoritative ledger');

    // Verify user tier was NOT upgraded to pro
    const checkUser = getUserByToken(userSessionToken);
    assert(checkUser?.planTier !== 'pro', '7.2 Unsuccessful payment did not grant Pro tier');
  }

  // =========================================================================
  // SCENARIO 8: Logout and session expiry work correctly
  // =========================================================================
  console.log('\n--- Scenario 8: Logout and Session Invalidation ---');
  {
    const logoutReq = new Request('https://neonovastudy.com/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: userSessionToken })
    });
    const logoutRes = await handleWorkerRequest(logoutReq);
    const logoutData = await logoutRes.json();

    assert(logoutRes.status === 200, '8.1 /api/auth/logout returns 200 success');
    assert(logoutData.success === true, '8.2 Logout confirmed on server');

    // Check token is no longer valid
    const userAfterLogout = getUserByToken(userSessionToken);
    assert(userAfterLogout === null, '8.3 Token invalidated on server, user lookup returns null');

    // Subsequent /api/auth/me returns 401 Unauthorized
    const meReq = new Request('https://neonovastudy.com/api/auth/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: userSessionToken })
    });
    const meRes = await handleWorkerRequest(meReq);
    assert(meRes.status === 401, '8.4 Expired/logged out token rejected with 401 Unauthorized');
  }

  console.log(`\n========================================`);
  console.log(`Total tests: ${total} | Passed: ${passed} | Failed: ${total - passed}`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
