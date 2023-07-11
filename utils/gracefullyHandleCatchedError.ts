import { DEBUG, SHOULD_FAIL_ALTOGETHER_IF_ONE_PROVIDER_FAILS } from '../config/Main';

export const gracefullyHandleCatchedError = (err: any): void => {
    if (SHOULD_FAIL_ALTOGETHER_IF_ONE_PROVIDER_FAILS) throw err;
    if (DEBUG) console.log(err);
};
