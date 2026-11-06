import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  const pathOnly = req.originalUrl.split('?')[0] ?? req.originalUrl;
  next(AppError.notFound(`Route ${req.method} ${pathOnly} was not found`));
};
