import { Router } from 'express';
const router = Router();

import * as ChartController from '../controllers/ChartController';

/**
 * Precise data returns for charts
 */
router.get('/v1/Activities', ChartController.getActivities);
router.get('/v1/AssetList', ChartController.getAssetList);

export default router;
