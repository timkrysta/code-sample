import Big, { BigSource } from "big.js";
import { ConversionService } from "./ConversionService";

export class BNBConversionService {
    static readonly decimalPlaces: number = 18;

    static dropToBNB(drop: BigSource): Big {
        return ConversionService.convertFromBaseUnit(drop, this.decimalPlaces);
    }

    static BNBToDrop(BNB: BigSource): Big {
        return ConversionService.convertToBaseUnit(BNB, this.decimalPlaces);
    }
}
