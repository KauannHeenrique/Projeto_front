"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function TestCookie() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("Testando login...");
    
    try {
      console.log("🔐 Testando login...");
      const response = await api.post("/Usuario/Login", {
        cpf: "12345678901",
        senha: "teste"
      }, {
        withCredentials: true,
      });
      
      console.log("📨 Resposta do login:", response);
      setResult(`✅ Login: ${response.status} - ${response.data.mensagem}`);
      
      // Verifica cookies após login
      console.log("🍪 Cookies após login:", document.cookie);
      setResult(prev => prev + `\n🍪 Cookies: ${document.cookie}`);
      
    } catch (error: any) {
      console.error("❌ Erro no login:", error);
      setResult(`❌ Erro login: ${error?.response?.status} - ${error?.response?.data?.mensagem || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    setLoading(true);
    setResult("Testando perfil...");
    
    try {
      console.log("👤 Testando perfil...");
      console.log("🍪 Cookies antes da requisição:", document.cookie);
      
      const response = await api.get("/Usuario/perfil", {
        withCredentials: true,
      });
      
      console.log("📨 Resposta do perfil:", response);
      setResult(`✅ Perfil: ${response.status} - ${response.data.nome}`);
      
    } catch (error: any) {
      console.error("❌ Erro no perfil:", error);
      setResult(`❌ Erro perfil: ${error?.response?.status} - ${error?.response?.data?.mensagem || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCookies = () => {
    console.log("🍪 Cookies atuais:", document.cookie);
    setResult(`🍪 Cookies: ${document.cookie}`);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Teste de Cookies</h2>
      
      <div className="space-y-2 mb-4">
        <Button onClick={testLogin} disabled={loading} size="sm">
          Testar Login
        </Button>
        <Button onClick={testProfile} disabled={loading} size="sm" variant="outline">
          Testar Perfil
        </Button>
        <Button onClick={checkCookies} disabled={loading} size="sm" variant="outline">
          Verificar Cookies
        </Button>
      </div>

      <div className="text-sm">
        <p><strong>Resultado:</strong></p>
        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
          {result}
        </pre>
      </div>
    </div>
  );
} 