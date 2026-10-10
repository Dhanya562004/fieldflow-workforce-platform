import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Authentication & Authorization Suite', () => {
  const testEmail = `test.dispatcher.${Date.now()}@fieldflow.io`;

  it('POST /api/auth/register creates a new user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        name: 'Jordan Sparks',
        role: 'MANAGER',
        phone: '+1-555-0188',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
  });

  it('POST /api/auth/register returns 409 when email already exists', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        name: 'Duplicate Sparks',
        role: 'MANAGER',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('POST /api/auth/login succeeds with seeded manager credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@fieldflow.io',
        password: 'Manager123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.role).toBe('MANAGER');
  });

  it('POST /api/auth/login fails with invalid password credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@fieldflow.io',
        password: 'IncorrectPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/auth/me returns current user when authenticated with Bearer token', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@fieldflow.io',
        password: 'Manager123!',
      });
    const token = loginRes.body.data.token;

    // 2. Query Me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe('manager@fieldflow.io');
    expect(meRes.body.data.role).toBe('MANAGER');
  });

  it('GET /api/auth/me returns 401 when no token is supplied', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
