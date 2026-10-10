import { api } from '../src/api/client';

describe('Mobile API Client & Token Management', () => {
  beforeEach(async () => {
    await api.clearToken();
  });

  it('correctly configures and formats base URL', () => {
    api.setBaseUrl('http://192.168.1.100:5000/api/');
    expect(api.getBaseUrl()).toBe('http://192.168.1.100:5000/api');
  });

  it('saves, retrieves, and clears authentication token', async () => {
    const testJwt = 'mock.jwt.token.string';
    await api.saveToken(testJwt);
    const retrieved = await api.getToken();
    expect(retrieved).toBe(testJwt);

    await api.clearToken();
    const afterClear = await api.getToken();
    expect(afterClear).toBeNull();
  });

  it('handles network failure gracefully without crashing', async () => {
    api.setBaseUrl('http://127.0.0.1:59998/api');
    const res = await api.getMyJobs();
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
