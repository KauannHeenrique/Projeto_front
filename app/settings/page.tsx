"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BsChevronDoubleLeft } from "react-icons/bs";
import api from "@/services/api";
import { formatCPF, formatPhone } from "@/services/formatValues";


interface Perfil {
  UsuarioId: number;
  Documento: string;
  NivelAcesso: string;
  Nome?: string;
  Email?: string;
  Telefone?: string;
  Bloco?: string;
  Apartamento?: string;
  DataCadastro?: string;
}

export default function Profile() {
  const [user, setUser] = useState<Perfil | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
  const { data } = await api.get("/Usuario/perfil", { withCredentials: true });

  setUser({
    UsuarioId: data.usuarioId,
    Documento: data.documento,
    NivelAcesso: data.nivelAcesso,
    Nome: data.nome,
    Email: data.email,
    Telefone: data.telefone,
    Bloco: data.bloco,
    Apartamento: data.apartamento,
    DataCadastro: data.dataCadastro,
  });
} catch (err: any) {
  const msg = err?.response?.data?.mensagem || "Erro ao carregar perfil.";
  console.error("Erro:", msg);
}

    };

    fetchPerfil();
  }, []);

  const handleChangePassword = () => {
    router.push("/changePassword");
  };

  if (!user) {
    return <div className="p-8 text-center">Carregando perfil...</div>;
  }

  const displayOrDash = (value?: string | number | null) => {
    return value !== undefined && value !== null && value !== "" ? value : "-";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
  <Button
    type="button"
    onClick={() => router.back()}
    variant="ghost"
    className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
  >
    <BsChevronDoubleLeft size={16} />
    Voltar
  </Button>
</div>


      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Meu Perfil</h1>

        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-3xl font-bold">
            {user.Nome ? user.Nome.charAt(0).toUpperCase() : "?"}
          </div>

          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{user.Nome || "Nome não disponível"}</h2>
            <p className="text-gray-600">{user.Email || "Email não disponível"}</p>
          </div>
        </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-6 gap-y-8 mb-8">

          <div>
            <label className="block font-medium text-gray-700 mb-1">Bloco</label>
            <p className="text-gray-800">{displayOrDash(user.Bloco)}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Apartamento</label>
            <p className="text-gray-800">{displayOrDash(user.Apartamento)}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Telefone</label>
            <p className="text-gray-800">
            {user.Telefone ? formatPhone(user.Telefone) : "-"}
          </p>

          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Data de cadastro</label>
            <p className="text-gray-800">{user.DataCadastro ? new Date(user.DataCadastro).toLocaleDateString() : "-"}</p>
          </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button variant="outline" onClick={handleChangePassword}>
              Alterar Senha
            </Button>
            <Button variant="outline" onClick={() => setShowHelp(true)}>
              Ajuda
            </Button>
          </div>

        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 max-w-sm w-full shadow-lg relative">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl"
                aria-label="Fechar"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Contato de Suporte</h3>
              <p>Em caso de dúvidas ou problemas, envie um e-mail para:</p>
              <p className="mt-2 font-mono text-[#26c9a8]">suporte.condominiojk@gmail.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
