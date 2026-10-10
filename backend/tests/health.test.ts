import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Health & Status Probes', () => {
  it('GET /health returns 200 with service metadata and connected database', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('fieldflow-operations-api');
    expect(res.body.database).toBe('connected');
    expect(res.body).toHaveProperty('uptimeSeconds');
  });

  it('GET /api/docs/spec.json returns OpenAPI specification document', async () => {
    const res = await request(app).get('/api/docs/spec.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info.title).toContain('FieldFlow');
  });

  it('GET non-existent route returns standard 404 error envelope', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
