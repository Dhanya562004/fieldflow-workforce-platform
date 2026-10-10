import { Router, Request, Response } from 'express';

const router = Router();

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'FieldFlow Operations REST API',
    version: '1.0.0',
    description: 'Workforce Operations & Field Dispatching Platform API for Web and Mobile clients',
  },
  servers: [
    {
      url: '/api',
      description: 'Current Environment API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Service health check and database connectivity probe',
        responses: { 200: { description: 'Service operational' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Technician & Manager login',
        responses: { 200: { description: 'JWT token and user profile returned' } },
      },
    },
    '/jobs': {
      get: {
        summary: 'List filterable jobs (technicians receive assigned work only)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Paginated job records' } },
      },
      post: {
        summary: 'Create new field job',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Job created' } },
      },
    },
    '/jobs/{id}/status': {
      patch: {
        summary: 'Update work order status (ASSIGNED -> IN_PROGRESS -> COMPLETED)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Status updated' } },
      },
    },
    '/dashboard/summary': {
      get: {
        summary: 'Real-time KPI summary (total, in progress, completed, overdue)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'KPI dataset' } },
      },
    },
    '/ai/suggest-priority': {
      post: {
        summary: 'AI priority suggestion with reasoning and risk factors',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Priority recommendation' } },
      },
    },
  },
};

router.get('/spec.json', (req: Request, res: Response) => {
  res.status(200).json(openApiSpec);
});

router.get('/', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>FieldFlow API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .top-banner { background: #1e293b; color: white; padding: 14px 24px; font-weight: 600; font-size: 1.1rem; }
  </style>
</head>
<body>
  <div class="top-banner">FieldFlow API Explorer &amp; Shared Schema Contract</div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/spec.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ]
    });
  </script>
</body>
</html>
  `);
});

export default router;
