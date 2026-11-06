import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';

/**
 * Root of the versioned API (mounted at /api/v1).
 * Feature modules register here as they are added, e.g. router.use('/auth', authRoutes).
 */
const router = Router();

router.use('/health', healthRoutes);

export default router;
