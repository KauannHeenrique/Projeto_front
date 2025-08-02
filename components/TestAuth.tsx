"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export default function TestAuth() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const token = Cookies.get("auth_token");

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Teste de Autenticação</h2>
      
      <div className="space-y-2 text-sm">
        <p><strong>Loading:</strong> {loading ? "Sim" : "Não"}</p>
        <p><strong>Autenticado:</strong> {isAuthenticated ? "Sim" : "Não"}</p>
        <p><strong>Token no Cookie:</strong> {token ? "Sim" : "Não"}</p>
        <p><strong>Token:</strong> {token ? token.substring(0, 20) + "..." : "Nenhum"}</p>
        
        {user && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p><strong>Usuário:</strong> {user.nome}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Nível:</strong> {user.nivelAcesso}</p>
          </div>
        )}
      </div>

      <div className="mt-4 space-x-2">
        <Button onClick={logout} variant="outline" size="sm">
          Logout
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          size="sm"
        >
          Recarregar
        </Button>
      </div>
    </div>
  );
} 