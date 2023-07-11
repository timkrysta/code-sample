import Big, { BigSource } from "big.js";

export class ConversionService {
    static convertFromBaseUnit(value: BigSource, decimalPlaces: number): Big {
        const convertedValue = new Big(value).div(10 ** decimalPlaces);
        return convertedValue;
    }

    static convertToBaseUnit(value: BigSource, decimalPlaces: number): Big {
        const baseUnitValue = new Big(value).mul(10 ** decimalPlaces);
        return baseUnitValue;
    }
}
