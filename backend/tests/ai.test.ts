import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('AI Provider Adapter & Fallback Engine Suite', () => {
  let token: string;
  let testJobId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@fieldflow.io', password: 'Manager123!' });
    token = res.body.data.token;

    const jobsRes = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${token}`);
    testJobId = jobsRes.body.data[0].id;
  });

  it('GET /api/ai/health reports provider status and fallback readiness', async () => {
    const res = await request(app)
      .get('/api/ai/health')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.fallbackEngineActive).toBe(true);
  });

  it('Suggests CRITICAL priority for hazardous/outage emergency signals', async () => {
    const res = await request(app)
      .post('/api/ai/suggest-priority')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Emergency Ammonia Chiller Leak In Freezer Room',
        description: 'Sensor alarm screaming. Evacuated personnel from sector C.',
        customerTier: 'ENTERPRISE_MISSION_CRITICAL',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.suggestedPriority).toBe('CRITICAL');
    expect(res.body.data.confidence).toBeGreaterThanOrEqual(0.9);
    expect(res.body.data.riskFactors.length).toBeGreaterThan(0);
    expect(res.body.data.provider).toMatch(/gemini|deterministic-fallback/);
  });

  it('Suggests LOW priority for routine non-urgent maintenance', async () => {
    const res = await request(app)
      .post('/api/ai/suggest-priority')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Quarterly Routine HVAC Filter Replacement',
        description: 'Standard quarterly scheduled air filter swap.',
        customerTier: 'STANDARD',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.suggestedPriority).toBe('LOW');
  });

  it('POST /api/ai/summarize-job generates executive summary from work order and notes', async () => {
    const res = await request(app)
      .post('/api/ai/summarize-job')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobId: testJobId });

    expect(res.status).toBe(200);
    expect(res.body.data.jobId).toBe(testJobId);
    expect(typeof res.body.data.summary).toBe('string');
    expect(Array.isArray(res.body.data.keyFindings)).toBe(true);
    expect(typeof res.body.data.recommendedNextStep).toBe('string');
  });

  it('Rejects invalid input schema with 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/ai/summarize-job')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobId: 'not-a-valid-uuid' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
