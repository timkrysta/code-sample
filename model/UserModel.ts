import { Schema, Document, Model, model } from 'mongoose';
import { WalletType } from '../enums/WalletType';

export interface IUser {
    username: string;
    password: string;
    email: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    address?: string;
    profile?: string;
    exchanges?: any;
    wallets?: any;
}

export interface IUserDocument extends IUser, Document {

}

interface IUserModel extends Model<IUserDocument> {

}

const UserSchema: Schema<IUserDocument> = new Schema({
    username: {
        type: String,
        required: [true, 'Please provide an username'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        unique: false,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    mobile: {
        type: String,
    },
    address: {
        type: String,
    },
    profile: {
        type: String,
    },
    exchanges: {
        type: [
            {
                name: { type: String, default: '' },
                apiKey: { type: String, default: '' },
                apiSecret: { type: String, default: '' },
                passPhrase: { type: String, default: '' },
                isActive: { type: Boolean, default: true },
            },
        ],
        default: [],
    },
    wallets: {
        type: [
            {
                type: {
                    type: String,
                    enum: Object.values(WalletType),
                    default: ''
                },
                name: { type: String, default: '' },
                address: { type: String, default: '' },
                isActive: { type: Boolean, default: true },
            },
        ],
        default: [],
    },
});

const UserModel = model<IUserDocument, IUserModel>('User', UserSchema);

export default UserModel;
