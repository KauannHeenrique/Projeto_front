"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FiUser, FiUsers, FiSave } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { formatCPF, formatCNPJ, cleanDocument } from "@/services/formatValues"; 

export default function AddManualEntry() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const registradoPor = user?.nome ?? "usuário_indefinido";

  const [tipo, setTipo] = useState<"morador" | "visitante" | "">("");
  const [cpf, setCpf] = useState("");
  const [morador, setMorador] = useState<any>(null);
  const [observacao, setObservacao] = useState("");
  const [mensagem, setMensagem] = useState("");

  const buscarMorador = async () => {
  const cpfLimpo = cleanDocument(cpf);

    try {
    const { data } = await api.get("/Usuario/BuscarUsuarioPor", {
      params: { documento: cpfLimpo },
    });

    if (Array.isArray(data) && data.length > 0) {
      setMorador(data[0]);
      setMensagem("");
    } else {
      setMorador(null);
      setMensagem(data.mensagem || "Morador não encontrado.");
    }
  } catch {
    setMensagem("Erro ao buscar morador.");
  }
};



  const salvarEntrada = async () => {
  if (!morador || !user) return;

  const body = {
    usuarioId: morador.usuarioId,
    observacao,
    registradoPor,
  };

  try {
    const { data } = await api.post("/AcessoEntradaMorador/RegistrarEntradaManual", body);
    setMensagem("Entrada registrada com sucesso!");
    setTimeout(() => router.push("/accessLog"), 2000);
  } catch (error: any) {
    const msg = error?.response?.data?.mensagem || "Erro ao registrar entrada.";
    setMensagem(msg);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando dados do operador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
        <Button
          type="button"
          onClick={() => router.push("/accessLog")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={16} />
          Voltar
        </Button>

        {tipo === "morador" && morador && (
          <Button
            onClick={salvarEntrada}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <FiSave size={16} />
            Salvar
          </Button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-center mb-6">Registrar Entrada Manual</h1>

        {!tipo && (
          <div className="space-y-4">
            <p className="text-gray-700 font-medium text-lg text-center">
              Deseja registrar entrada de:
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setTipo("morador")}
                className="w-32 h-32 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2"
              >
                <FiUser size={32} className="text-indigo-600" />
                <span className="font-semibold text-gray-700">Morador</span>
              </button>
              <button
                disabled
                title="Em breve"
                className="w-32 h-32 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-gray-400 flex flex-col items-center justify-center gap-2 cursor-not-allowed"
              >
                <FiUsers size={32} />
                <span className="font-semibold">Visitante</span>
              </button>
            </div>
          </div>
        )}

        {tipo === "morador" && (
          <div className="space-y-6 mt-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Documento do Morador</label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                />
              </div>
              <Button onClick={buscarMorador}>Buscar</Button>
            </div>

            {mensagem && <div className="text-sm text-red-600">{mensagem}</div>}

            {morador && (
              <div className="bg-white border rounded p-4 space-y-2">
                {/* Foto (se houver) */}
                {morador.fotoUrl && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={morador.fotoUrl}
                      alt={`Foto de ${morador.nome}`}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  </div>
                )}
                <p><strong>Nome:</strong> {morador.nome}</p>
                <p><strong>Bloco:</strong> {morador.apartamento?.bloco || "-"}</p>
                <p><strong>Apartamento:</strong> {morador.apartamento?.numero || "-"}</p>
                <p><strong>Registrado por:</strong> {registradoPor}</p>
              </div>
            )}

            {morador && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Observação</label>
                  <Input
                    placeholder="Ex: Entrou pela portaria lateral"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
