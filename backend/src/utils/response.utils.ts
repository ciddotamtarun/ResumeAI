import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, statusCode = 200): void => {
  res.status(statusCode).json({ success: true, ...data });
};

export const sendError = (res: Response, message: string, statusCode = 500): void => {
  res.status(statusCode).json({ success: false, message });
};
