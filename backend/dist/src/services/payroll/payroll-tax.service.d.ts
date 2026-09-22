import { Model } from 'mongoose';
import { TaxConfig, TaxConfigDocument } from 'src/schemas/tax-config.schema';
export declare class PayrollTaxService {
    private readonly taxConfigModel;
    constructor(taxConfigModel: Model<TaxConfigDocument>);
    loadActiveGlobalConfig(): Promise<TaxConfigDocument | null>;
    computeTaxForAnnualIncome(amount: number, config?: Partial<TaxConfig>): Promise<number>;
    computeMonthlyTax(amount: number, config?: Partial<TaxConfig>): Promise<number>;
    getTaxConfigs(entity?: string): Promise<any>;
    saveTaxConfig(payload: any): Promise<any>;
}
