import Big, { BigSource } from "big.js";
import { ConversionService } from "./ConversionService";

export class BitcoinConversionService {
    static readonly decimalPlaces: number = 8;

    static satoshiToBtc(satoshi: BigSource): Big {
        return ConversionService.convertFromBaseUnit(satoshi, this.decimalPlaces);
    }

    static btcToSatoshi(bitcoin: BigSource): Big {
        return ConversionService.convertToBaseUnit(bitcoin, this.decimalPlaces);
    }
}
