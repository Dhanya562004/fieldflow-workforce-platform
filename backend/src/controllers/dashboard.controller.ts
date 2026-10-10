import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await DashboardService.getSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getJobTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await DashboardService.getJobTrends();
      res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkload(req: Request, res: Response, next: NextFunction) {
    try {
      const workload = await DashboardService.getWorkload();
      res.status(200).json({
        success: true,
        data: workload,
      });
    } catch (error) {
      next(error);
    }
  }
}
