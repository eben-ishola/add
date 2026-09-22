import { RequestSourceDto } from './request-source.dto';
export declare class SignInDto extends RequestSourceDto {
    identifier?: string;
    username?: string;
    password: string;
    mfaTrustToken?: string;
}
