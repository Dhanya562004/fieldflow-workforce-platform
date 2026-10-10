import { Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler.middleware';

export class JobController {
  static async listJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await JobService.listJobs(req.query as any, req.user!);
      res.status(200).json({
        success: true,
        data: result.jobs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getJobById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.getJobById(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.createJob(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: job,
        message: 'Job work order created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.updateJob(req.params.id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        data: job,
        message: 'Job updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.updateJobStatus(req.params.id, req.body, req.user!);
      res.status(200).json({
        success: true,
        data: job,
        message: `Job status transitioned to ${req.body.status}`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobService.assignJob(req.params.id, req.body.technicianId, req.user!.id);
      res.status(200).json({
        success: true,
        data: job,
        message: 'Job assignment updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async addNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const note = await JobService.addJobNote(req.params.id, req.body, req.user!);
      res.status(201).json({
        success: true,
        data: note,
        message: 'Note logged successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded or file rejected by validator', 400, 'FILE_MISSING');
      }

      const attachment = await JobService.addAttachment(
        req.params.id,
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        req.user!.id
      );

      res.status(201).json({
        success: true,
        data: attachment,
        message: 'Attachment uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
