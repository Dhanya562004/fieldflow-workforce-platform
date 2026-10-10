import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/ai.service';

export class AiController {
  static async summarizeJob(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await AiService.summarizeJob(req.body.jobId);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async suggestPriority(req: Request, res: Response, next: NextFunction) {
    try {
      const suggestion = await AiService.suggestPriority(req.body);
      res.status(200).json({
        success: true,
        data: suggestion,
      });
    } catch (error) {
      next(error);
    }
  }

  static async health(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      data: AiService.getHealth(),
    });
  }
}
