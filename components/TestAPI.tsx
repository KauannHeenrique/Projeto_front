"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function TestAPI() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult("Testando...");
    
    try {
      console.log("Testando conectividade com API...");
      const response = await api.get("/Usuario/perfil", {
        withCredentials: true,
      });
      
      console.log("Resposta da API:", response);
      setResult(`✅ API funcionando! Status: ${response.status}`);
    } catch (error: any) {
      console.error("Erro na API:", error);
      setResult(`❌ Erro: ${error?.response?.status} - ${error?.response?.data?.mensagem || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult("Testando login...");
    
    try {
      console.log("Testando login...");
      const response = await api.post("/Usuario/Login", {
        cpf: "12345678901",
        senha: "teste"
      }, {
        withCredentials: true,
      });
      
      console.log("Resposta do login:", response);
      setResult(`✅ Login testado! Status: ${response.status}`);
    } catch (error: any) {
      console.error("Erro no login:", error);
      setResult(`❌ Erro login: ${error?.response?.status} - ${error?.response?.data?.mensagem || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Teste de API</h2>
      
      <div className="space-y-2 mb-4">
        <Button onClick={testAPI} disabled={loading} size="sm">
          Testar API
        </Button>
        <Button onClick={testLogin} disabled={loading} size="sm" variant="outline">
          Testar Login
        </Button>
      </div>

      <div className="text-sm">
        <p><strong>Resultado:</strong></p>
        <p className="mt-2 p-2 bg-gray-50 rounded">{result}</p>
      </div>
    </div>
  );
} 