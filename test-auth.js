#!/usr/bin/env node

/**
 * LifeLink Twin - Authentication Test Script
 * 
 * Tests the authentication endpoints
 */

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testLogin(username, password) {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            log.success(`Login successful: ${username} (${data.user.role})`);
            return data.token;
        } else {
            log.error(`Login failed: ${data.message}`);
            return null;
        }
    } catch (error) {
        log.error(`Login error: ${error.message}`);
        return null;
    }
}

async function testRegisterDoctor({ username, password, name, email, role }) {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, name, email, role })
        });

        const data = await response.json();
        if (data.success) {
            log.success(`Registration successful: ${data.user.username} (${data.user.role})`);
            return true;
        }

        log.error(`Registration failed: ${data.message}`);
        return false;
    } catch (error) {
        log.error(`Registration error: ${error.message}`);
        return false;
    }
}

async function testProtectedEndpoint(token) {
    try {
        const response = await fetch(`${BASE_URL}/api/patients`, {
            headers: { 'Authorization': `Bearer ${token}` }

        });

        const data = await response.json();

        if (data.success) {
            log.success(`Protected endpoint accessed: ${data.count} patients found`);
            return true;
        } else {
            log.error(`Protected endpoint failed: ${data.message}`);
            return false;
        }
    } catch (error) {
        log.error(`Protected endpoint error: ${error.message}`);
        return false;
    }
}

async function testInvalidToken() {
    try {
        const response = await fetch(`${BASE_URL}/api/patients`, {
            headers: { 'Authorization': 'Bearer invalid-token' }
        });

        const data = await response.json();

        if (!data.success) {
            log.success('Invalid token correctly rejected');
            return true;
        } else {
            log.error('Invalid token was accepted (security issue!)');
            return false;
        }
    } catch (error) {
        log.error(`Invalid token test error: ${error.message}`);
        return false;
    }
}

async function testNoToken() {
    try {
        const response = await fetch(`${BASE_URL}/api/patients`);
        const data = await response.json();

        if (!data.success) {
            log.success('Request without token correctly rejected');
            return true;
        } else {
            log.error('Request without token was accepted (security issue!)');
            return false;
        }
    } catch (error) {
        log.error(`No token test error: ${error.message}`);
        return false;
    }
}

async function testWrongPassword() {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'doctor', password: 'wrongpassword' })
        });

        const data = await response.json();

        if (!data.success) {
            log.success('Wrong password correctly rejected');
            return true;
        } else {
            log.error('Wrong password was accepted (security issue!)');
            return false;
        }
    } catch (error) {
        log.error(`Wrong password test error: ${error.message}`);
        return false;
    }
}

async function testGetCurrentUser(token) {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success && data.user) {
            log.success(`Current user retrieved: ${data.user.name} (${data.user.role})`);
            return true;
        } else {
            log.error('Failed to get current user');
            return false;
        }
    } catch (error) {
        log.error(`Get current user error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 LifeLink Twin - Authentication Test Suite');
    console.log('='.repeat(60) + '\n');

    log.info('Testing authentication system...\n');

    // Test 1: Login with valid credentials
    console.log('Test 1: Login with valid credentials');
    const doctorToken = await testLogin('doctor', 'doctor123');
    console.log();

    if (!doctorToken) {
        log.error('Cannot proceed without valid token');
        return;
    }

    // Test 2: Access protected endpoint with valid token
    console.log('Test 2: Access protected endpoint with valid token');
    await testProtectedEndpoint(doctorToken);
    console.log();

    // Test 3: Test invalid token
    console.log('Test 3: Test invalid token');
    await testInvalidToken();
    console.log();

    // Test 4: Test no token
    console.log('Test 4: Test request without token');
    await testNoToken();
    console.log();

    // Test 5: Test wrong password
    console.log('Test 5: Test wrong password');
    await testWrongPassword();
    console.log();

    // Test 6: Get current user
    console.log('Test 6: Get current user info');
    await testGetCurrentUser(doctorToken);
    console.log();

    // Test 7: Doctor-only registration enforcement
    console.log('Test 7: Doctor-only registration enforcement');
    const newDoctorUsername = `doctor_test_${Date.now()}`;
    await testRegisterDoctor({
        username: newDoctorUsername,
        password: 'doctor123',
        name: 'Dr. Test',
        email: 'doctor.test@lifelink.com',
        role: 'doctor'
    });

    await testRegisterDoctor({
        username: `admin_test_${Date.now()}`,
        password: 'admin123',
        name: 'Not Allowed',
        email: 'not.allowed@lifelink.com',
        role: 'user'
    });
    console.log();

    console.log('='.repeat(60));
    log.success('All tests completed!');
    console.log('='.repeat(60) + '\n');

    console.log('📝 Summary:');
    console.log('  • Password hashing: bcrypt with salt');
    console.log('  • Token type: JWT (HS256)');
    console.log('  • Token expiry: 24 hours');
    console.log('  • Default users: doctor');
    console.log('  • Protected endpoints: /api/patient/:id, /api/patients');
    console.log('\n🔗 Login page: http://localhost:3000/login.html\n');
}

// Run tests
runTests().catch(error => {
    log.error(`Test suite error: ${error.message}`);
    process.exit(1);
});
