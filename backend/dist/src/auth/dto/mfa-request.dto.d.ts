import { RequestSourceDto } from './request-source.dto';
export declare class MfaTokenDto extends RequestSourceDto {
    token: string;
}
export declare class VerifyMfaChallengeDto extends RequestSourceDto {
    challengeToken: string;
    code: string;
}
export declare class SetMfaPolicyDto extends RequestSourceDto {
    requireForAll: boolean;
}
