import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Dashboard Analytics & KPI Suite', () => {
  let managerToken: string;
  let techToken: string;

  beforeAll(async () => {
    const mgrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@fieldflow.io', password: 'Manager123!' });
    managerToken = mgrRes.body.data.token;

    const techRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marcus.vance@fieldflow.io', password: 'Tech123!' });
    techToken = techRes.body.data.token;
  });

  it('GET /api/dashboard/summary calculates accurate KPIs from database records', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalJobs');
    expect(res.body.data).toHaveProperty('inProgress');
    expect(res.body.data).toHaveProperty('completed');
    expect(res.body.data).toHaveProperty('overdue');
    expect(res.body.data).toHaveProperty('completionRate');
    expect(typeof res.body.data.totalJobs).toBe('number');
    expect(res.body.data.totalJobs).toBeGreaterThan(0);
  });

  it('GET /api/dashboard/job-trends returns daily trends and status breakdowns', async () => {
    const res = await request(app)
      .get('/api/dashboard/job-trends')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('trends');
    expect(Array.isArray(res.body.data.trends)).toBe(true);
    expect(res.body.data.trends.length).toBe(14);
    expect(res.body.data).toHaveProperty('byStatus');
    expect(res.body.data).toHaveProperty('byPriority');
  });

  it('GET /api/dashboard/workload returns technician utilization metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard/workload')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('workload');
    expect(Array.isArray(res.body.data.workload)).toBe(true);
    expect(res.body.data.workload.length).toBeGreaterThan(0);
    expect(res.body.data.workload[0]).toHaveProperty('utilizationPercent');
  });

  it('Technicians cannot access operations dashboard endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${techToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
