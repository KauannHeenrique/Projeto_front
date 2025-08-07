import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://172.20.10.2:5263/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor para adicionar token no header Authorization
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token adicionado ao header:", token.substring(0, 20) + "...");
    }
  }
  return config;
});

// ✅ Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    console.log("✅ Resposta da API:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Erro da API:", error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      Cookies.remove("auth_token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
