"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const router = useRouter();

  const toggleShowPasswords = () => setShowPasswords(!showPasswords);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("As novas senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://172.20.10.2:5263/api/Usuario/AlterarSenha", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          senhaAtual: currentPassword,
          novaSenha: newPassword
        })
      });

      if (response.ok) {
        setSuccess("Senha alterada com sucesso!");
        setTimeout(() => router.push("/settings"), 2000);
      } else {
        const data = await response.json();
        setError(data.mensagem || "Erro ao alterar a senha.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Alterar Senha</h1>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Senha Atual</label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Nova Senha</label>
            <div className="relative">
              <Input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleShowPasswords}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPasswords ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Confirmar Nova Senha</label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-[#26c9a8] text-white" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Alterar Senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
