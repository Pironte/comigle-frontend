export interface CreateUserResponse {
    success: boolean,
    message: string,
    errors: IdentityError[]
}

interface IdentityError {
    code: string,
    description: string
}