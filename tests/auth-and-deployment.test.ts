import { handleWorkerRequest } from '../src/server/workerHandler';
import { getUserByToken } from '../src/server/userStore';
import { verifyMathEquation, evaluateMathExpression } from '../src/server/symbolicMathEngine';
import { calculateMolarMass } from '../src/server/scienceReasoningEngine';

async function runTestSuite() {
  console.log('--- NeoNova Backend & Authentication Test Suite ---');
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

  // 1. CORS Preflight
  {
    const req = new Request('https://neonovastudy.com/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://neonovastudy.com',
        'Access-Control-Request-Method': 'POST'
      }
    });
    const res = await handleWorkerRequest(req);
    assert(res.status === 204, 'CORS preflight returns 204 No Content');
    assert(res.headers.get('Access-Control-Allow-Origin') === '*', 'CORS preflight includes Allow-Origin');
  }

  // 2. Malformed JSON
  {
    const req = new Request('https://neonovastudy.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"brokenJson: '
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 400, 'Malformed JSON returns 400 status');
    assert(data.error === 'Malformed JSON payload', 'Malformed JSON returns controlled error message');
  }

  // 3. Unknown account rejected safely
  {
    const req = new Request('https://neonovastudy.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'nonexistent_user_9999@example.com',
        password: 'password123'
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 401, 'Unknown account returns 401 status');
    assert(data.error === 'Incorrect email or password.', 'Unknown account returns safe generic error');
  }

  // 4. Missing fields handled safely
  {
    const req = new Request('https://neonovastudy.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '',
        password: ''
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 401 || res.status === 400, 'Missing fields returns 401 or 400');
    assert(data.error === 'Please enter your email and password.', 'Missing fields error message is friendly');
  }

  // 5. User Registration Flow
  const testEmail = `student_${Date.now()}@example.com`;
  const testUser = `student_${Date.now()}`;
  const testPassword = 'StrongPassword123!';
  let authToken = '';

  {
    const req = new Request('https://neonovastudy.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser,
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        grade: 'Grade 9',
        planTier: 'starter'
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 201, 'Registration returns 201 Created');
    assert(data.success === true, 'Registration data indicates success');
    assert(data.user && data.user.email === testEmail, 'Registered user object returned without sensitive fields');
    assert(data.user.passwordHash === undefined, 'Password hash is NOT exposed in sanitized user');
    assert(data.user.passwordSalt === undefined, 'Password salt is NOT exposed in sanitized user');
    authToken = data.token;
  }

  // 6. Valid account login
  {
    const req = new Request('https://neonovastudy.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: testPassword
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 200, 'Valid login returns 200 OK');
    assert(data.success === true, 'Login data indicates success');
    assert(typeof data.token === 'string' && data.token.startsWith('neo_sess_'), 'Login returns valid session token');
    authToken = data.token;
  }

  // 7. Incorrect password rejected
  {
    const req = new Request('https://neonovastudy.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: 'CompletelyWrongPassword!'
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 401, 'Incorrect password returns 401 status');
    assert(data.error === 'Incorrect email or password.', 'Incorrect password returns safe generic error');
  }

  // 8. Session verification /api/auth/me
  {
    const req = new Request('https://neonovastudy.com/api/auth/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: authToken
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 200, 'Session verification returns 200 OK');
    assert(data.user && data.user.email === testEmail, 'Session verification identifies correct user');
  }

  // 9. Logout flow
  {
    const req = new Request('https://neonovastudy.com/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: authToken
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 200, 'Logout returns 200 OK');
    assert(data.success === true, 'Logout data indicates success');

    // Verify token no longer active
    const userAfter = getUserByToken(authToken);
    assert(userAfter === null, 'Session token invalidated after logout');
  }

  // 10. Health check endpoint
  {
    const req = new Request('https://neonovastudy.com/api/health', {
      method: 'GET'
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 200, 'Health endpoint returns 200 OK');
    assert(data.status === 'ok', 'Health status is ok');
  }

  // 11. Credit Card Payment - Merchant Info
  {
    const req = new Request('https://neonovastudy.com/api/payment/merchant-info', {
      method: 'GET'
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 200, 'Payment merchant info returns 200 OK');
    assert(data.settlementBank === 'Bank of Baroda', 'Settlement bank is Bank of Baroda');
    assert(data.accountNumberMasked.endsWith('5536'), 'Settlement account ends in 5536');
  }

  // 12. Credit Card Payment - Server Order Creation & Price Calculation
  let createdOrderId = '';
  {
    const req = new Request('https://neonovastudy.com/api/payment/create-card-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'plus',
        billingCycle: 'monthly',
        studentName: 'Test Student',
        studentEmail: 'student@example.com'
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 200, 'Create card order returns 200 OK');
    assert(data.success === true, 'Order created successfully');
    assert(data.amount === 99, 'Plus monthly price strictly calculated on server as 99 INR');
    assert(data.amountInPaise === 9900, 'Amount in paise is 9900');
    assert(Boolean(data.orderId), 'Order ID is returned');
    createdOrderId = data.orderId;
  }

  // 13. Credit Card Payment - Authoritative Verification
  {
    const req = new Request('https://neonovastudy.com/api/payment/verify-card-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: createdOrderId,
        gatewayPaymentId: 'pay_test_' + Date.now(),
        tier: 'plus',
        billingCycle: 'monthly',
        studentName: 'Test Student',
        studentEmail: 'student@example.com'
      })
    });
    const res = await handleWorkerRequest(req);
    const data = await res.json();
    assert(res.status === 200, 'Verify card payment returns 200 OK');
    assert(data.verified === true, 'Card payment verified successfully on server');
    assert(data.verifiedState && data.verifiedState.tier === 'plus', 'User subscription updated to Plus tier');
  }

  // 14. Symbolic Math Verification - Equation Solving
  {
    const eqCheck = verifyMathEquation('2x + 7 = 19', 'x', 6);
    assert(eqCheck.verified === true, 'Symbolic Math Engine accurately verifies 2(6) + 7 = 19');
    assert(eqCheck.lhs === 19 && eqCheck.rhs === 19, 'LHS and RHS equality confirmed with zero divergence');

    const wrongCheck = verifyMathEquation('2x + 7 = 19', 'x', 5);
    assert(wrongCheck.verified === false, 'Incorrect root x = 5 is correctly rejected');
  }

  // 15. Symbolic Math Verification - Fraction & Arithmetic Reduction
  {
    const evalRes = evaluateMathExpression('3/4 + 5/6');
    assert(evalRes.success === true, 'Fractions evaluated successfully');
    assert(String(evalRes.result).startsWith('1.5833') || evalRes.result === '19/12', 'Accurate fractional arithmetic result');
  }

  // 16. Science Engine - Molar Mass & Chemical Accuracy
  {
    const waterMass = calculateMolarMass('H2O');
    assert(waterMass !== null, 'Molar mass of H2O calculated');
    assert(Math.round(waterMass!.molarMass) === 18, 'Molar mass of H2O is ~18 g/mol');

    const sulfuricMass = calculateMolarMass('H2SO4');
    assert(sulfuricMass !== null, 'Molar mass of H2SO4 calculated');
    assert(Math.round(sulfuricMass!.molarMass) === 98, 'Molar mass of H2SO4 is ~98 g/mol');
  }

  // 17. OCR API endpoint availability
  {
    const req = new Request('https://neonovastudy.com/api/solver/ocr-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const res = await handleWorkerRequest(req);
    assert(res.status === 400, 'OCR endpoint requires image payload and returns 400 safely when empty');
  }

  // 18. Google AdSense & AdMob Seller Verification (ads.txt & app-ads.txt)
  {
    const adsReq = new Request('https://neonovastudy.com/ads.txt', { method: 'GET' });
    const adsRes = await handleWorkerRequest(adsReq);
    const adsContent = await adsRes.text();
    assert(adsRes.status === 200, 'ads.txt returns 200 OK');
    assert(adsContent.includes('pub-2809682199317733'), 'ads.txt contains publisher ID');

    const appAdsReq = new Request('https://neonovastudy.com/app-ads.txt', { method: 'GET' });
    const appAdsRes = await handleWorkerRequest(appAdsReq);
    const appAdsContent = await appAdsRes.text();
    assert(appAdsRes.status === 200, 'app-ads.txt returns 200 OK');
    assert(appAdsContent.includes('pub-2809682199317733'), 'app-ads.txt contains publisher ID');
  }

  console.log(`\nResults: ${passed}/${total} tests passed.`);
}

runTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
