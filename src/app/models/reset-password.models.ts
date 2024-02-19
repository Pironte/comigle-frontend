export class ResetPasswordRequest {
    constructor(
        public userId: string,
        public token: string,
        public newPassword: string,
        public confirmPassword: string
    ) { }
}