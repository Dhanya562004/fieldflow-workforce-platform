import { Request, Response, NextFunction } from 'express';
import { TechnicianService } from '../services/technician.service';

export class TechnicianController {
  static async listTechnicians(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TechnicianService.listTechnicians();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTechnicianById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TechnicianService.getTechnicianById(req.params.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTechnician(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TechnicianService.createTechnician(req.body);
      res.status(201).json({
        success: true,
        data,
        message: 'Technician account created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTechnician(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TechnicianService.updateTechnician(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data,
        message: 'Technician profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
