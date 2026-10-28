import { handleWorkerRequest } from '../src/server/workerHandler';
import { getUserByToken, registerUser } from '../src/server/userStore';
import { canAccessFeature, hasEntitlement } from '../src/lib/billing';

async function runPaymentSecuritySuite() {
  console.log('--- NeoNova PhonePe QR Payment Security & Verification Test Suite ---');
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

  // Create test students
  const student1Id = `std1_${runSeed}`;
  const student1 = registerUser({
    email: `${student1Id}@test.edu`,
    username: student1Id,
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    grade: 'Grade 9',
    studentName: 'Student One'
  });

  const student2Id = `std2_${runSeed}`;
  const student2 = registerUser({
    email: `${student2Id}@test.edu`,
    username: student2Id,
    password: 'SecurePass456!',
    confirmPassword: 'SecurePass456!',
    grade: 'Grade 10',
    studentName: 'Student Two'
  });

  if (!student1.user || !student2.user) {
    throw new Error('Failed to setup test users');
  }

  // Verify initial tier is strictly starter
  const initialUser1 = getUserByToken(student1.token);
  assert(initialUser1?.planTier === 'starter', 'Setup: Student 1 starts strictly as starter');

  // =========================================================================
  // MANDATORY SECURITY TEST 1: Random numbers entered as a transaction ID
  // =========================================================================
  console.log('\n--- Test 1: Random numbers entered as a transaction ID ---');
  {
    const randomOrderId = `ORD-RAND-${runSeed}`;
    const randomNumberUtr = `98${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const verifyReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: randomOrderId,
        transactionRef: randomNumberUtr,
        tier: 'plus',
        billingCycle: 'monthly',
        expectedAmount: 99,
        studentName: 'Student One',
        studentEmail: student1.user.email,
        accountId: student1.user.id,
        token: student1.token,
        paymentMethod: 'upi'
      })
    });

    const verifyRes = await handleWorkerRequest(verifyReq, {});
    const data = await verifyRes.json() as any;

    assert(verifyRes.status === 200, '1.1 Verify endpoint returns 200 with result payload');
    assert(data.verified === false, '1.2 Random numbers DO NOT automatically approve payment (verified === false)');
    assert(data.status === 'PENDING', '1.3 Transaction is held in PENDING status awaiting admin verification');
    assert(data.message.includes('Waiting for verification'), '1.4 Shows message: "Payment submitted. Waiting for verification."');

    // Confirm student tier remains starter in database
    const userAfterRandom = getUserByToken(student1.token);
    assert(userAfterRandom?.planTier === 'starter', '1.5 Premium access remains DISABLED for random transaction ID');
    assert(canAccessFeature(userAfterRandom?.planTier || 'starter', 'ai_tutor').allowed === false, '1.6 Premium entitlement (ai_tutor) remains locked');
  }

  // =========================================================================
  // MANDATORY SECURITY TEST 2: A nonexistent transaction reference
  // =========================================================================
  console.log('\n--- Test 2: A nonexistent transaction reference ---');
  {
    const nonexistentRef = `NONEXISTENT_UTR_${runSeed}`;
    const statusReq = new Request('http://localhost:3000/api/payment/check-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: nonexistentRef,
        orderId: `ORD-NONEXIST-${runSeed}`
      })
    });

    const statusRes = await handleWorkerRequest(statusReq, {});
    const statusData = await statusRes.json() as any;

    assert(statusData.verified === false, '2.1 Nonexistent transaction is not verified');
    assert(statusData.found === false, '2.2 Nonexistent transaction not found in ledger');
    assert(statusData.message.includes("We couldn't verify this payment"), '2.3 Shows message: "We couldn\'t verify this payment..."');

    const user = getUserByToken(student1.token);
    assert(user?.planTier === 'starter', '2.4 Premium tier remains starter for nonexistent reference');
  }

  // =========================================================================
  // MANDATORY SECURITY TEST 3: A reference for a payment that was never received
  // =========================================================================
  console.log('\n--- Test 3: A reference for a payment that was never received ---');
  {
    const unreceivedRef = `UNREC_${runSeed}`;
    const unreceivedOrder = `ORD-UNREC-${runSeed}`;

    // Student submits the reference
    const submitReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: unreceivedOrder,
        transactionRef: unreceivedRef,
        tier: 'pro',
        billingCycle: 'yearly',
        expectedAmount: 1799,
        studentName: 'Student One',
        studentEmail: student1.user.email,
        accountId: student1.user.id,
        token: student1.token,
        paymentMethod: 'upi'
      })
    });

    const submitRes = await handleWorkerRequest(submitReq, {});
    const submitData = await submitRes.json() as any;

    assert(submitData.verified === false, '3.1 Unreceived payment is NOT verified upon submission');
    assert(submitData.status === 'PENDING', '3.2 Unreceived payment marked as PENDING');

    // Admin reviews and sees payment never arrived in bank account, so rejects it
    const rejectReq = new Request('http://localhost:3000/api/admin/reject-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminKey: 'naisarg-admin-2026',
        transactionId: unreceivedRef,
        reason: 'Payment not received in PhonePe / Bank of Baroda account 5536'
      })
    });

    const rejectRes = await handleWorkerRequest(rejectReq, {});
    const rejectData = await rejectRes.json() as any;
    assert(rejectRes.status === 200, '3.3 Administrator rejects unreceived payment');
    assert(rejectData.transaction.status === 'FAILED', '3.4 Transaction status transitions to FAILED');

    const user = getUserByToken(student1.token);
    assert(user?.planTier === 'starter', '3.5 Premium access remains revoked and disabled');
  }

  // =========================================================================
  // MANDATORY SECURITY TEST 4: A real payment with the wrong amount
  // =========================================================================
  console.log('\n--- Test 4: A real payment with the wrong amount ---');
  {
    const mismatchRef = `MISMATCH_${runSeed}`;
    const mismatchOrder = `ORD-MISMATCH-${runSeed}`;

    // Expected monthly plus is ₹99, student submits ₹49
    const mismatchReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: mismatchOrder,
        transactionRef: mismatchRef,
        tier: 'plus',
        billingCycle: 'monthly',
        expectedAmount: 49, // WRONG AMOUNT: expected is 99
        studentName: 'Student One',
        studentEmail: student1.user.email,
        accountId: student1.user.id,
        token: student1.token,
        paymentMethod: 'upi'
      })
    });

    const mismatchRes = await handleWorkerRequest(mismatchReq, {});
    const mismatchData = await mismatchRes.json() as any;

    assert(mismatchData.verified === false, '4.1 Wrong amount is NOT verified');
    assert(mismatchData.status === 'REVIEW_REQUIRED', '4.2 Status flagged strictly as REVIEW_REQUIRED');
    assert(mismatchData.reason === 'AMOUNT_MISMATCH', '4.3 Reason identified as AMOUNT_MISMATCH');
    assert(mismatchData.message.includes('does not match'), '4.4 Clear message explaining amount mismatch');

    const user = getUserByToken(student1.token);
    assert(user?.planTier === 'starter', '4.5 Premium tier is NOT unlocked for mismatched payment amount');
  }

  // =========================================================================
  // MANDATORY SECURITY TEST 5: A duplicate transaction reference
  // =========================================================================
  console.log('\n--- Test 5: A duplicate transaction reference ---');
  {
    const duplicateRef = `DUP_${runSeed}`;
    const order1 = `ORD-DUP1-${runSeed}`;
    const order2 = `ORD-DUP2-${runSeed}`;

    // Pre-authorize and verify the transaction for student 1
    const authReq = new Request('http://localhost:3000/api/admin/authorize-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminKey: 'naisarg-admin-2026',
        transactionId: duplicateRef,
        orderId: order1,
        planTier: 'plus',
        billingCycle: 'monthly',
        amount: 99,
        studentName: 'Student One',
        studentEmail: student1.user.email,
        accountId: student1.user.id,
        status: 'verified'
      })
    });
    await handleWorkerRequest(authReq, {});

    // Student 1 claims it -> succeeds
    const claim1Req = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order1,
        transactionRef: duplicateRef,
        tier: 'plus',
        billingCycle: 'monthly',
        expectedAmount: 99,
        studentName: 'Student One',
        studentEmail: student1.user.email,
        accountId: student1.user.id,
        token: student1.token,
        paymentMethod: 'upi'
      })
    });
    const claim1Res = await handleWorkerRequest(claim1Req, {});
    const claim1Data = await claim1Res.json() as any;
    assert(claim1Data.verified === true, '5.1 Legitimate owner can verify matching transaction');

    // Now Student 2 attempts to claim the EXACT SAME transaction reference under order1
    const claim2Req = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order1,
        transactionRef: duplicateRef,
        tier: 'plus',
        billingCycle: 'monthly',
        expectedAmount: 99,
        studentName: 'Student Two',
        studentEmail: student2.user.email,
        accountId: student2.user.id,
        token: student2.token,
        paymentMethod: 'upi'
      })
    });
    const claim2Res = await handleWorkerRequest(claim2Req, {});
    const claim2Data = await claim2Res.json() as any;

    assert(claim2Data.verified === false, '5.2 Duplicate use of transaction is strictly REJECTED');
    assert(claim2Data.reason === 'ALREADY_USED', '5.3 Rejection reason flagged as ALREADY_USED');

    const user2 = getUserByToken(student2.token);
    assert(user2?.planTier === 'starter', '5.4 Second student DOES NOT receive premium access from duplicate reference');
  }

  // =========================================================================
  // MANDATORY SECURITY TEST 6: A reference belonging to a different order
  // =========================================================================
  console.log('\n--- Test 6: A reference belonging to a different order ---');
  {
    const orderMismatchRef = `ORD_MIS_${runSeed}`;
    const originalOrder = `ORD-ORIG-${runSeed}`;
    const forgedOrder = `ORD-FORGED-${runSeed}`;

    // Create entry in ledger tied to originalOrder
    const initReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: originalOrder,
        transactionRef: orderMismatchRef,
        tier: 'plus',
        billingCycle: 'monthly',
        expectedAmount: 99,
        studentName: 'Student Two',
        studentEmail: student2.user.email,
        accountId: student2.user.id,
        token: student2.token,
        paymentMethod: 'upi'
      })
    });
    await handleWorkerRequest(initReq, {});

    // Attempt to verify with forgedOrder
    const forgeReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: forgedOrder, // MISMATCHED ORDER ID
        transactionRef: orderMismatchRef,
        tier: 'plus',
        billingCycle: 'monthly',
        expectedAmount: 99,
        studentName: 'Student Two',
        studentEmail: student2.user.email,
        accountId: student2.user.id,
        token: student2.token,
        paymentMethod: 'upi'
      })
    });
    const forgeRes = await handleWorkerRequest(forgeReq, {});
    const forgeData = await forgeRes.json() as any;

    assert(forgeData.verified === false, '6.1 Mismatched order reference is REJECTED');
    assert(forgeData.reason === 'ORDER_MISMATCH', '6.2 Rejection reason flagged as ORDER_MISMATCH');

    const user2 = getUserByToken(student2.token);
    assert(user2?.planTier === 'starter', '6.3 Premium access remains disabled for mismatched order');
  }

  // =========================================================================
  // MANDATORY SECURITY TEST 7: An unauthorized user attempting to approve a payment
  // =========================================================================
  console.log('\n--- Test 7: An unauthorized user attempting to approve a payment ---');
  {
    const targetTxnRef = `TARGET_${runSeed}`;
    const targetOrder = `ORD-TARGET-${runSeed}`;

    // Student 2 creates a pending payment
    await handleWorkerRequest(new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: targetOrder,
        transactionRef: targetTxnRef,
        tier: 'pro',
        billingCycle: 'monthly',
        expectedAmount: 199,
        studentName: 'Student Two',
        studentEmail: student2.user.email,
        accountId: student2.user.id,
        token: student2.token,
        paymentMethod: 'upi'
      })
    }), {});

    // Unauthorized attacker attempts to approve using a fake admin key
    const attackReq = new Request('http://localhost:3000/api/admin/approve-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminKey: 'invalid-hacker-key-999',
        transactionId: targetTxnRef,
        adminNotes: 'I am approving myself'
      })
    });

    const attackRes = await handleWorkerRequest(attackReq, {});
    const attackData = await attackRes.json() as any;

    assert(attackRes.status === 403, '7.1 Unauthorized approval attempt returns 403 Forbidden');
    assert(attackData.success === false, '7.2 Unauthorized approval payload marks success: false');

    // Confirm student 2 still has starter tier
    const user2 = getUserByToken(student2.token);
    assert(user2?.planTier === 'starter', '7.3 Attacker could not approve payment; user remains on starter plan');
  }

  // =========================================================================
  // MANDATORY SECURITY TEST 8: A genuine payment independently confirmed in merchant records
  // =========================================================================
  console.log('\n--- Test 8: A genuine payment independently confirmed in merchant records ---');
  {
    const genuineTxnRef = `GENUINE_${runSeed}`;
    const genuineOrderId = `ORD-GENUINE-${runSeed}`;

    // 1. Student submits the transaction reference
    const submitReq = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: genuineOrderId,
        transactionRef: genuineTxnRef,
        tier: 'pro',
        billingCycle: 'yearly',
        expectedAmount: 1799,
        studentName: 'Student Two',
        studentEmail: student2.user.email,
        accountId: student2.user.id,
        token: student2.token,
        paymentMethod: 'upi'
      })
    });
    const submitRes = await handleWorkerRequest(submitReq, {});
    const submitData = await submitRes.json() as any;
    assert(submitData.verified === false, '8.1 Initial submission is held in PENDING');

    // 2. Administrator independently logs into PhonePe Merchant portal / Bank of Baroda account 5536,
    // verifies that ₹1799 was received with matching UTR, and approves it.
    const adminApproveReq = new Request('http://localhost:3000/api/admin/approve-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminKey: 'naisarg-admin-2026',
        transactionId: genuineTxnRef,
        adminName: 'Naisarg Ramdatti (Administrator)',
        adminNotes: 'Confirmed in PhonePe Merchant Bank of Baroda statement for ₹1799'
      })
    });

    const adminApproveRes = await handleWorkerRequest(adminApproveReq, {});
    const adminApproveData = await adminApproveRes.json() as any;
    assert(adminApproveRes.status === 200, '8.2 Administrator approval returns 200 OK');
    assert(adminApproveData.success === true, '8.3 Admin approval successful in authoritative ledger');
    assert(adminApproveData.transaction.status === 'VERIFIED', '8.4 Transaction status is strictly VERIFIED');

    // 3. User checks payment status or verifies
    const checkReq = new Request('http://localhost:3000/api/payment/check-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: genuineTxnRef,
        orderId: genuineOrderId,
        accountId: student2.user.id
      })
    });

    const checkRes = await handleWorkerRequest(checkReq, {});
    const checkData = await checkRes.json() as any;
    assert(checkData.verified === true, '8.5 User check-status confirms payment is VERIFIED');
    assert(checkData.message.includes('Payment verified'), '8.6 Displays: "Payment verified. Your subscription is now active."');

    // 4. Confirm user account in userStore now has PRO tier and active entitlements
    const finalUser2 = getUserByToken(student2.token);
    assert(finalUser2?.planTier === 'pro', '8.7 Genuine confirmed payment securely updates user tier to PRO');
    assert(hasEntitlement(finalUser2?.planTier || 'starter', 'pro') === true, '8.8 Pro entitlement level is actively confirmed');
    assert(canAccessFeature(finalUser2?.planTier || 'starter', 'ai_tutor').allowed === true, '8.9 Pro feature (ai_tutor) is actively granted');
    assert(canAccessFeature(finalUser2?.planTier || 'starter', 'three_d_lab').allowed === true, '8.10 Plus/Pro feature (three_d_lab) is actively granted');
  }

  console.log(`\n========================================`);
  console.log(`Payment Security Tests: ${passed}/${total} passed.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runPaymentSecuritySuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
