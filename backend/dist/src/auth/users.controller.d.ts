import { AuthService } from './services/auth.service';
export declare class UsersController {
    private readonly authService;
    constructor(authService: AuthService);
    getProfile(user: any): Promise<any>;
}
