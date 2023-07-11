import Big, { BigSource } from "big.js";
import { ConversionService } from "./ConversionService";

export class EtherConversionService {
    static readonly decimalPlaces: number = 18;

    static weiToETH(wei: BigSource): Big {
        return ConversionService.convertFromBaseUnit(wei, this.decimalPlaces);
    }

    static ETHToWei(ETH: BigSource): Big {
        return ConversionService.convertToBaseUnit(ETH, this.decimalPlaces);
    }
}
