import api from "./axios";

export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.post("/auth/verify-email", { token });
  return response.data;
};

export const resendVerificationEmail = async (email: string) => {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/get-current-user");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};