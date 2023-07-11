import { Response } from 'express';
import { ChartService } from '../services/ChartService';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequestInterface';
import { DEBUG } from '../config/Main';

export async function getAssetList(req: AuthenticatedRequest, res: Response) {
    try {
        const data = await ChartService.getAssetListData(req.user);
        return res.json(data);
    } catch (err) {
        if (DEBUG) console.log(err);
        res.status(500).json({ error: err.message });
    }
}

export async function getActivities(req: AuthenticatedRequest, res: Response) {
    try {
        const data = await ChartService.getActivitiesData(req.user);
        return res.json(data);
    } catch (err) {
        if (DEBUG) console.log(err);
        res.status(500).json({ error: err.message });
    }
}

