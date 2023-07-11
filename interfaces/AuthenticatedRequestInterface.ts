import { Request } from 'express';
import { IUserDocument } from '../model/UserModel';

export interface AuthenticatedRequest extends Request {
    user?: IUserDocument;
}
