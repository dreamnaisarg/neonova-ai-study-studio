import { handleWorkerRequest } from '../src/server/workerHandler';
import { getUserByToken, registerUser } from '../src/server/userStore';
import { canAccessFeature, hasEntitlement } from '../src/lib/billing';
import { registerVerifiedProviderSettlement, MERCHANT_ACCOUNT_CONFIG } from '../src/server/paymentProviderService';

async function runInstantPaymentVerificationSuite() {
  console.log('--- NeoNova Instant Payment Verification & Automatic Premium Activation Test Suite ---');
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

  const runSeed = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // 1. Setup Test Cadets
  const cadetAId = `cadetA_${runSeed}`;
  const cadetA = registerUser({
    email: `${cadetAId}@neonova.academy`,
    username: cadetAId,
    password: 'CadetPassword123!',
    confirmPassword: 'CadetPassword123!',
    grade: 'Grade 10',
    studentName: 'Cadet Alice'
  });

  const cadetBId = `cadetB_${runSeed}`;
  const cadetB = registerUser({
    email: `${cadetBId}@neonova.academy`,
    username: cadetBId,
    password: 'CadetPassword456!',
    confirmPassword: 'CadetPassword456!',
    grade: 'Grade 11',
    studentName: 'Cadet Bob'
  });

  if (!cadetA.user || !cadetB.user) {
    throw new Error('Failed to register test cadets');
  }

  assert(getUserByToken(cadetA.token)?.planTier === 'starter', 'Setup: Cadet Alice starts strictly as starter');
  assert(getUserByToken(cadetB.token)?.planTier === 'starter', 'Setup: Cadet Bob starts strictly as starter');

  // =========================================================================
  // TEST 1: Automated Verification Latency Under 3 Seconds (Target < 3000ms)
  // =========================================================================
  console.log('\n--- Test 1: Sub-3-Second Automated Verification & Activation ---');
  {
    const orderId = `ORD-INSTANT-${runSeed}`;
    const utrRef = `UTR_PHONEPE_${runSeed}`;
    const planPrice = 199; // Pro monthly

    // Provider confirms payment in merchant records
    registerVerifiedProviderSettlement({
      providerReference: utrRef,
      merchantVpa: MERCHANT_ACCOUNT_CONFIG.vpa,
      merchantAccount: MERCHANT_ACCOUNT_CONFIG.accountMasked,
      beneficiaryName: MERCHANT_ACCOUNT_CONFIG.beneficiaryName,
      orderId: orderId,
      amount: planPrice,
      currency: 'INR',
      status: 'SUCCESS',
      settledAt: new Date().toISOString()
    });

    const startTime = Date.now();

    const verifyReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        transactionRef: utrRef,
        tier: 'pro',
        billingCycle: 'monthly',
        expectedAmount: planPrice,
        studentName: 'Cadet Alice',
        studentEmail: cadetA.user.email,
        accountId: cadetA.user.id,
        token: cadetA.token,
        paymentMethod: 'upi'
      })
    });

    const verifyRes = await handleWorkerRequest(verifyReq, {});
    const elapsedMs = Date.now() - startTime;
    const data = await verifyRes.json() as any;

    assert(verifyRes.status === 200, '1.1 Verification endpoint returns 200 OK');
    assert(data.verified === true, '1.2 Verified status confirmed automatically');
    assert(data.status === 'VERIFIED', '1.3 Transaction marked strictly as VERIFIED');
    assert(elapsedMs < 3000, `1.4 Activation latency under 3 seconds (measured: ${elapsedMs}ms, target < 3000ms)`);
    assert(data.message.includes('Payment verified'), '1.5 Official activation message returned');

    // Confirm database subscription updated immediately
    const userAfter = getUserByToken(cadetA.token);
    assert(userAfter?.planTier === 'pro', '1.6 User subscription tier upgraded to pro');
    assert(canAccessFeature('pro', 'ai_tutor').allowed === true, '1.7 Pro feature (ai_tutor) immediately unlocked');
    assert(canAccessFeature('pro', 'exam_prep').allowed === true, '1.8 Pro feature (exam_prep) immediately unlocked');
  }

  // =========================================================================
  // TEST 2: Never Trust a Transaction ID Alone (Random UTR Stays PENDING)
  // =========================================================================
  console.log('\n--- Test 2: Random / Fabricated Transaction ID Fails Closed ---');
  {
    const randomUtr = `RANDOM_UTR_${runSeed}_${Math.floor(100000 + Math.random() * 900000)}`;
    const randomOrderId = `ORD-RANDOM-${runSeed}`;

    const verifyReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: randomOrderId,
        transactionRef: randomUtr,
        tier: 'pro',
        billingCycle: 'yearly',
        expectedAmount: 1799,
        studentName: 'Cadet Bob',
        studentEmail: cadetB.user.email,
        accountId: cadetB.user.id,
        token: cadetB.token,
        paymentMethod: 'upi'
      })
    });

    const verifyRes = await handleWorkerRequest(verifyReq, {});
    const data = await verifyRes.json() as any;

    assert(data.verified === false, '2.1 Random transaction ID is not verified');
    assert(data.status === 'PENDING', '2.2 Random transaction held in PENDING awaiting real provider settlement');
    assert(getUserByToken(cadetB.token)?.planTier === 'starter', '2.3 Cadet Bob plan tier remains strictly starter');
    assert(canAccessFeature(getUserByToken(cadetB.token)?.planTier || 'starter', 'ai_tutor').allowed === false, '2.4 Premium feature remains locked');
  }

  // =========================================================================
  // TEST 3: Provider Webhook & Real-Time Reconciliation
  // =========================================================================
  console.log('\n--- Test 3: Provider Webhook Settlement Reconciles Pending Order ---');
  {
    const webhookOrderId = `ORD-WEBHOOK-${runSeed}`;
    const webhookUtr = `UTR_HOOK_${runSeed}`;

    // 1. Cadet B submits pending payment
    await handleWorkerRequest(new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: webhookOrderId,
        transactionRef: webhookUtr,
        tier: 'plus',
        billingCycle: 'monthly',
        expectedAmount: 99,
        studentName: 'Cadet Bob',
        studentEmail: cadetB.user.email,
        accountId: cadetB.user.id,
        token: cadetB.token,
        paymentMethod: 'upi'
      })
    }), {});

    // 2. Provider sends settlement notification webhook
    const webhookReq = new Request('http://localhost:3000/api/payment/provider-settlement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerReference: webhookUtr,
        orderId: webhookOrderId,
        amount: 99,
        currency: 'INR',
        status: 'SUCCESS'
      })
    });

    const webhookRes = await handleWorkerRequest(webhookReq, {});
    const webhookData = await webhookRes.json() as any;

    assert(webhookRes.status === 200, '3.1 Webhook endpoint returns 200 OK');
    assert(webhookData.success === true, '3.2 Webhook payload accepted and recorded');
    assert(webhookData.reconciled === true, '3.3 Pending order atomically reconciled to VERIFIED');

    // 3. User checks status via polling
    const pollReq = new Request('http://localhost:3000/api/payment/check-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: webhookOrderId,
        transactionId: webhookUtr,
        accountId: cadetB.user.id
      })
    });
    const pollRes = await handleWorkerRequest(pollReq, {});
    const pollData = await pollRes.json() as any;

    assert(pollData.verified === true, '3.4 User poll detects active verification immediately');
    assert(getUserByToken(cadetB.token)?.planTier === 'plus', '3.5 Cadet Bob upgraded to plus plan');
  }

  // =========================================================================
  // TEST 4: Amount Mismatch Validation
  // =========================================================================
  console.log('\n--- Test 4: Amount Mismatch Flagged as REVIEW_REQUIRED ---');
  {
    const mismatchUtr = `UTR_MISMATCH_${runSeed}`;
    const mismatchOrderId = `ORD-MISMATCH-${runSeed}`;

    // Provider settled ₹50 instead of ₹199
    registerVerifiedProviderSettlement({
      providerReference: mismatchUtr,
      merchantVpa: MERCHANT_ACCOUNT_CONFIG.vpa,
      merchantAccount: MERCHANT_ACCOUNT_CONFIG.accountMasked,
      beneficiaryName: MERCHANT_ACCOUNT_CONFIG.beneficiaryName,
      orderId: mismatchOrderId,
      amount: 50, // Wrong amount!
      currency: 'INR',
      status: 'SUCCESS',
      settledAt: new Date().toISOString()
    });

    const verifyReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: mismatchOrderId,
        transactionRef: mismatchUtr,
        tier: 'pro',
        billingCycle: 'monthly',
        expectedAmount: 50, // Mismatched amount against plan price (₹199)
        studentName: 'Cadet Bob',
        studentEmail: cadetB.user.email,
        accountId: cadetB.user.id,
        token: cadetB.token,
        paymentMethod: 'upi'
      })
    });

    const verifyRes = await handleWorkerRequest(verifyReq, {});
    const data = await verifyRes.json() as any;

    assert(data.verified === false, '4.1 Mismatched amount is not verified');
    assert(data.status === 'REVIEW_REQUIRED', '4.2 Mismatched amount flagged strictly as REVIEW_REQUIRED');
    assert(data.reason === 'AMOUNT_MISMATCH', '4.3 Rejection reason flagged as AMOUNT_MISMATCH');
  }

  // =========================================================================
  // TEST 5: Anti-Replay / Duplicate Claim Protection & Order Isolation
  // =========================================================================
  console.log('\n--- Test 5: Duplicate Payment Claim Rejection ---');
  {
    // Cadet B tries to reuse Cadet A's already-verified transaction from Test 1
    const utrFromTest1 = `UTR_PHONEPE_${runSeed}`;
    const orderIdFromTest1 = `ORD-INSTANT-${runSeed}`;

    const duplicateReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderIdFromTest1,
        transactionRef: utrFromTest1,
        tier: 'pro',
        billingCycle: 'monthly',
        expectedAmount: 199,
        studentName: 'Cadet Bob',
        studentEmail: cadetB.user.email,
        accountId: cadetB.user.id,
        token: cadetB.token,
        paymentMethod: 'upi'
      })
    });

    const duplicateRes = await handleWorkerRequest(duplicateReq, {});
    const data = await duplicateRes.json() as any;

    assert(data.verified === false, '5.1 Duplicate transaction attempt rejected');
    assert(data.reason === 'ALREADY_USED', '5.2 Rejection reason flagged as ALREADY_USED');
    assert(data.message.includes('already been claimed') || data.message.includes('already been applied'), '5.3 Informative duplicate claim message shown');

    // 5B: A reference belonging to a different order is rejected with ORDER_MISMATCH
    const mismatchedOrderReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: `ORD-DIFFERENT-${runSeed}`,
        transactionRef: utrFromTest1,
        tier: 'pro',
        billingCycle: 'monthly',
        expectedAmount: 199,
        studentName: 'Cadet Bob',
        studentEmail: cadetB.user.email,
        accountId: cadetB.user.id,
        token: cadetB.token,
        paymentMethod: 'upi'
      })
    });
    const mismatchedOrderRes = await handleWorkerRequest(mismatchedOrderReq, {});
    const mismatchedData = await mismatchedOrderRes.json() as any;
    assert(mismatchedData.verified === false, '5.4 Reference with different order ID rejected');
    assert(mismatchedData.reason === 'ORDER_MISMATCH', '5.5 Order mismatch reason flagged as ORDER_MISMATCH');
  }

  // =========================================================================
  // TEST 6: 3D-Secure Card Payment Order & Verification
  // =========================================================================
  console.log('\n--- Test 6: 3D-Secure Card Order Creation & Verification ---');
  {
    const cardOrderReq = new Request('http://localhost:3000/api/payment/create-card-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'pro',
        billingCycle: 'yearly',
        studentName: 'Cadet Alice',
        studentEmail: cadetA.user.email,
        accountId: cadetA.user.id,
        token: cadetA.token
      })
    });

    const cardOrderRes = await handleWorkerRequest(cardOrderReq, {});
    const cardOrderData = await cardOrderRes.json() as any;

    assert(cardOrderRes.status === 200, '6.1 Card order endpoint returns 200 OK');
    assert(cardOrderData.success === true, '6.2 Card order successfully created');
    assert(cardOrderData.amount === 1799, '6.3 Authoritative Pro Yearly price is ₹1799');
    assert(cardOrderData.amountInPaise === 179900, '6.4 Amount in paise is 179900');

    // Verify card payment
    const cardVerifyReq = new Request('http://localhost:3000/api/payment/verify-card-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: cardOrderData.orderId,
        gatewayPaymentId: `pay_test_${runSeed}`,
        gatewayOrderId: cardOrderData.gatewayOrderId || `order_${runSeed}`,
        gatewaySignature: 'authoritative_mock_sig',
        tier: 'pro',
        billingCycle: 'yearly',
        studentName: 'Cadet Alice',
        studentEmail: cadetA.user.email,
        accountId: cadetA.user.id,
        token: cadetA.token
      })
    });

    const cardVerifyRes = await handleWorkerRequest(cardVerifyReq, {});
    const cardVerifyData = await cardVerifyRes.json() as any;

    assert(cardVerifyRes.status === 200, '6.5 Card verification returns 200 OK');
    assert(cardVerifyData.verified === true, '6.6 Card payment marked as verified');
    assert(cardVerifyData.verifiedState?.status === 'active', '6.7 Verified card subscription status is active');
  }

  console.log(`\n========================================`);
  console.log(`Instant Payment Tests: ${passed}/${total} passed.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runInstantPaymentVerificationSuite().catch(err => {
  console.error('Fatal instant payment test error:', err);
  process.exit(1);
});
