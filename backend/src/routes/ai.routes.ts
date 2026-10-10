import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { summarizeJobSchema, suggestPrioritySchema } from '../schemas/ai.schema';

const router = Router();

router.use(authenticateJwt);

router.post('/summarize-job', validateBody(summarizeJobSchema), AiController.summarizeJob);
router.post('/suggest-priority', validateBody(suggestPrioritySchema), AiController.suggestPriority);
router.get('/health', AiController.health);

export default router;
