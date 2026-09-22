import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { MulterError } from 'multer';
export declare class MulterExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(error: MulterError, host: ArgumentsHost): void;
    private describe;
}
