import { RequestSourceDto } from './request-source.dto';
export declare class ChangePasswordDto extends RequestSourceDto {
    currentPassword: string;
    newPassword: string;
}
export declare class RequestPasswordResetDto extends RequestSourceDto {
    email: string;
}
export declare class VerifyPasswordResetDto extends RequestSourceDto {
    email: string;
    token: string;
}
export declare class ResetPasswordDto extends VerifyPasswordResetDto {
    newPassword: string;
}
