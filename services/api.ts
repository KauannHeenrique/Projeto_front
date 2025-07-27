import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.9:5263/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Adiciona token no header Authorization automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token"); // ou "authToken" dependendo de como você salvou
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
