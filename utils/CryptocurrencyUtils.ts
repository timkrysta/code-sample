import Cryptocurrency from '../model/Cryptocurrency.model';
import { CRYPTOCURRENCY_NAME_IF_UNABLE_TO_FIND_BY_TICKER } from '../config/Main';

export const getNameFromTicker = async (ticker: string): Promise<string> => {
    try {
        const cryptocurrency = await Cryptocurrency.findByTicker(ticker);
        return cryptocurrency ? cryptocurrency.name : CRYPTOCURRENCY_NAME_IF_UNABLE_TO_FIND_BY_TICKER;
    } catch (err) {
        throw err;
    }
};
