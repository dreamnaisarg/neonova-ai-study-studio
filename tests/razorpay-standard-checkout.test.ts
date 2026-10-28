import crypto from 'crypto';
import { handleWorkerRequest } from '../src/server/workerHandler';
import { getUserByToken, registerUser } from '../src/server/userStore';

async function runRazorpayStandardCheckoutSuite() {
  console.log('--- Razorpay Standard Web Checkout Integration Test Suite ---');
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

  // 1. Setup Test Cadet
  const cadet = registerUser({
    email: `razorpay_${runSeed}@neonova.academy`,
    username: `rzp_cadet_${runSeed}`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    grade: 'Grade 10',
    studentName: 'Razorpay Test Cadet'
  });

  if (!cadet.user) {
    throw new Error('Failed to register test cadet');
  }

  assert(getUserByToken(cadet.token)?.planTier === 'starter', 'Setup: Cadet starts strictly on starter plan');

  const testEnv = {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_TrguNqR3Yo84kk',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'HkFScd2JFlA7zOAqPETMxih2'
  };

  // =========================================================================
  // STEP 1: Backend - Create Order API Tests
  // =========================================================================
  console.log('\n--- Step 1: Create Order Endpoint (/api/create-order) ---');

  // 1.1 Amount validation: Minimum 100 paise
  {
    const req = new Request('http://localhost:3000/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50, currency: 'INR' }) // 50 paise is less than minimum 100
    });
    const res = await handleWorkerRequest(req, testEnv);
    const data = await res.json() as any;
    assert(res.status === 400, '1.1 Reject order with amount < 100 paise (HTTP 400)');
    assert(data.error.includes('100 paise'), '1.2 Clear error message requiring >= 100 paise');
  }

  // 1.2 Missing credentials handling (HTTP 401)
  {
    const req = new Request('http://localhost:3000/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 19900, currency: 'INR' })
    });
    const res = await handleWorkerRequest(req, { RAZORPAY_KEY_ID: '', RAZORPAY_KEY_SECRET: '' });
    assert(res.status === 401, '1.3 Return 401 when Razorpay credentials missing');
  }

  // 1.3 Successful Order Creation via Razorpay API
  let createdOrderId = '';
  {
    const req = new Request('http://localhost:3000/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 19900, // 199 INR
        currency: 'INR',
        receipt: `rcpt_test_${runSeed}`,
        tier: 'pro',
        billingCycle: 'monthly',
        studentName: 'Razorpay Test Cadet',
        studentEmail: cadet.user.email
      })
    });
    const res = await handleWorkerRequest(req, testEnv);
    const data = await res.json() as any;
    assert(res.status === 200, '1.4 /api/create-order returns HTTP 200 OK');
    assert(data.success === true, '1.5 Response marks success: true');
    assert(Boolean(data.order_id && data.order_id.startsWith('order_')), `1.6 Razorpay order_id created (${data.order_id})`);
    assert(data.amount === 19900, '1.7 Response matches amount in paise (19900)');
    assert(data.currency === 'INR', '1.8 Response matches currency INR');
    createdOrderId = data.order_id;
  }

  // =========================================================================
  // STEP 2 & 3: Signature Verification Tests
  // =========================================================================
  console.log('\n--- Step 3: Backend - Verify Signature (/api/verify-payment) ---');

  const testPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // 3.1 Missing required fields (HTTP 400)
  {
    const req = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: testPaymentId
        // missing razorpay_signature
      })
    });
    const res = await handleWorkerRequest(req, testEnv);
    const data = await res.json() as any;
    assert(res.status === 400, '3.1 Missing signature returns HTTP 400');
    assert(data.error.includes('required'), '3.2 Informative missing fields error');
  }

  // 3.2 Signature mismatch (Tampered / Invalid signature)
  {
    const fakeSignature = 'bad_forged_signature_0123456789abcdef';
    const req = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: fakeSignature,
        token: cadet.token,
        tier: 'pro'
      })
    });
    const res = await handleWorkerRequest(req, testEnv);
    const data = await res.json() as any;
    assert(res.status === 400, '3.3 Signature mismatch returns HTTP 400');
    assert(data.verified === false, '3.4 Payment is NOT marked as verified');
    assert(data.error.includes('Signature mismatch'), '3.5 Rejection reason confirms signature mismatch');

    const user = getUserByToken(cadet.token);
    assert(user?.planTier === 'starter', '3.6 User remains on starter plan after failed signature check');
  }

  // 3.3 Valid cryptographic signature (HMAC-SHA256 verification)
  {
    const validSignature = crypto
      .createHmac('sha256', testEnv.RAZORPAY_KEY_SECRET)
      .update(`${createdOrderId}|${testPaymentId}`)
      .digest('hex');

    const req = new Request('http://localhost:3000/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
        tier: 'pro',
        billingCycle: 'monthly',
        amount: 19900,
        studentName: 'Razorpay Test Cadet',
        studentEmail: cadet.user.email,
        token: cadet.token
      })
    });
    const res = await handleWorkerRequest(req, testEnv);
    const data = await res.json() as any;

    assert(res.status === 200, '3.7 Valid signature returns HTTP 200 OK');
    assert(data.verified === true, '3.8 Verification marked as true');
    assert(data.order_id === createdOrderId, '3.9 Response contains verified order_id');
    assert(data.payment_id === testPaymentId, '3.10 Response contains verified payment_id');
    assert(data.verifiedState?.status === 'active', '3.11 Verified subscription state is active');

    const user = getUserByToken(cadet.token);
    assert(user?.planTier === 'pro', '3.12 User account automatically upgraded to PRO plan');
  }

  console.log(`\n========================================`);
  console.log(`Razorpay Standard Checkout Tests: ${passed}/${total} passed.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runRazorpayStandardCheckoutSuite().catch(err => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
