import { handleWorkerRequest } from '../src/server/workerHandler';
import { getUserByToken } from '../src/server/userStore';

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

  console.log(`\nResults: ${passed}/${total} tests passed.`);
}

runTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
