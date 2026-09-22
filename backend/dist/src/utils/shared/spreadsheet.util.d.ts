import * as ExcelJS from 'exceljs';
type CellValueOptions = {
    defval?: any;
    useText?: boolean;
};
type BinarySource = ArrayBuffer | Uint8Array | Buffer;
export declare const loadWorkbook: (source: string | BinarySource, fileName?: string) => Promise<ExcelJS.Workbook>;
export declare const getFirstWorksheet: (workbook: ExcelJS.Workbook) => ExcelJS.Worksheet | undefined;
export declare const worksheetToRowArrays: (worksheet: ExcelJS.Worksheet, options?: CellValueOptions) => any[][];
export declare const worksheetToObjects: (worksheet: ExcelJS.Worksheet, options?: CellValueOptions) => {
    headers: string[];
    rows: Array<Record<string, any>>;
};
export declare const parseCsvText: (text: string) => string[][];
export declare const csvRowsToObjects: (rows: string[][], options?: {
    defval?: any;
    trim?: boolean;
}) => {
    headers: string[];
    rows: Array<Record<string, any>>;
};
export declare const csvBufferToRowArrays: (source: string | Buffer) => string[][];
export declare const csvBufferToObjects: (source: string | Buffer, options?: {
    defval?: any;
    trim?: boolean;
}) => {
    headers: string[];
    rows: Array<Record<string, any>>;
};
export {};
