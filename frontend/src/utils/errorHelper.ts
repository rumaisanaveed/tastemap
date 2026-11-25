import axios from "axios";

export function getErrorMessage(
    error: unknown,
    fallbackMessage = "Something went wrong. Please try again."
): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallbackMessage;
    }
    return fallbackMessage;
}
