import { v4 as uuidv4 } from 'uuid';

export const generateUUID = (): string => {
    const myUUID: string = uuidv4();
    return myUUID;
};
