export type SignupResponse = {
    name: string;
    email: string;
    password: string;
}

export type LoginResponse = Omit<SignupResponse, "name">;