import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Job Lifecycle & Authorization Suite', () => {
  let managerToken: string;
  let tech1Token: string;
  let tech2Token: string;
  let customerId: string;
  let createdJobId: string;

  beforeAll(async () => {
    // Obtain Manager token
    const mgrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@fieldflow.io', password: 'Manager123!' });
    managerToken = mgrRes.body.data.token;

    // Obtain Tech 1 token (Marcus Vance)
    const tech1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marcus.vance@fieldflow.io', password: 'Tech123!' });
    tech1Token = tech1Res.body.data.token;

    // Obtain Tech 2 token (Elena Rodriguez)
    const tech2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'elena.rodriguez@fieldflow.io', password: 'Tech123!' });
    tech2Token = tech2Res.body.data.token;

    // Get a customer
    const custRes = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${managerToken}`);
    customerId = custRes.body.data[0].id;
  });

  it('Manager can create a new work order', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Emergency Generator Air Intake Filter Replacement',
        description: 'Scheduled filter replacement following particulate alarm.',
        customerId,
        serviceAddress: '500 Technology Way, San Jose, CA',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('jobNumber');
    expect(res.body.data.status).toBe('OPEN');
    createdJobId = res.body.data.id;
  });

  it('Technician cannot create work orders (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({
        title: 'Unauthorized Job Attempt',
        customerId,
        serviceAddress: '123 Fake Street',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Manager can assign technician to job', async () => {
    // Get tech 1 user ID from tech1 token
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tech1Token}`);
    const tech1Id = meRes.body.data.id;

    const res = await request(app)
      .post(`/api/jobs/${createdJobId}/assign`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ technicianId: tech1Id });

    expect(res.status).toBe(200);
    expect(res.body.data.assignedTechnicianId).toBe(tech1Id);
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  it('Assigned technician can view their own job', async () => {
    const res = await request(app)
      .get(`/api/jobs/${createdJobId}`)
      .set('Authorization', `Bearer ${tech1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdJobId);
  });

  it('Non-assigned technician CANNOT access another technician private job (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/jobs/${createdJobId}`)
      .set('Authorization', `Bearer ${tech2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Assigned technician can update job status to IN_PROGRESS', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${createdJobId}/status`)
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({
        status: 'IN_PROGRESS',
        note: 'Arrived on site; safety lockout complete.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.startedAt).not.toBeNull();
  });

  it('Assigned technician can log progress notes', async () => {
    const res = await request(app)
      .post(`/api/jobs/${createdJobId}/notes`)
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({
        content: 'Secondary intake seal inspected and cleaned.',
        isInternal: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toContain('Secondary intake seal');
  });

  it('Assigned technician can complete the job', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${createdJobId}/status`)
      .set('Authorization', `Bearer ${tech1Token}`)
      .send({
        status: 'COMPLETED',
        note: 'New filters seated and differential pressure tested.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.completedAt).not.toBeNull();
  });

  it('Reject invalid status transition: Completed job cannot revert directly to OPEN (400)', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${createdJobId}/status`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'OPEN' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });
});
