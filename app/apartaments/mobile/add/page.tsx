"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BsChevronDoubleLeft } from "react-icons/bs";
import api from "@/services/api";

export default function AddApartmentPage() {
  const router = useRouter();
  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [situacao, setSituacao] = useState("1");
  const [observacoes, setObservacoes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação antes de enviar
    if (!bloco.trim() || !numero.trim() || !proprietario.trim()) {
      setApiMessage("Por favor, preencha todos os campos obrigatórios.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setApiMessage(null);
    setIsSuccess(false);

    const body = {
      bloco,
      numero,
      proprietario,
      situacao: Number(situacao),
      observacoes,
    };

    try {
      await api.post("/Apartamento/CadastrarApartamento", body);
      setApiMessage("Apartamento cadastrado com sucesso!");
      setIsSuccess(true);
      setTimeout(() => router.push("/apartaments"), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao conectar com a API.";
      setApiMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 sm:px-6 md:px-8 py-2 flex justify-between items-center shadow-sm">
          <Button
            type="button"
            onClick={() => router.push("/apartaments/mobile")}
            disabled={isLoading}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
          >
            <BsChevronDoubleLeft size={16} />
            Voltar
          </Button>
        </div>

      {/* Conteúdo */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4">Adicionar Apartamento</h1>

        {apiMessage && (
          <div
            className={`mb-4 p-4 rounded ${
              isSuccess
                ? "bg-green-100 text-green-700 border border-green-400"
                : "bg-red-100 text-red-700 border border-red-400"
            }`}
          >
            {apiMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bloco e Número */}
          <div className="flex gap-2">
            <div className="flex flex-col w-1/2">
              <label className="text-sm mb-1">
                Bloco <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: A"
                value={bloco}
                onChange={(e) => setBloco(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col w-1/2">
              <label className="text-sm mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 101"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Proprietário */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">
              Proprietário <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nome completo"
              value={proprietario}
              onChange={(e) => setProprietario(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Situação */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Situação</label>
            <select
              value={situacao}
              onChange={(e) => setSituacao(e.target.value)}
              disabled={isLoading}
              className="border rounded px-3 py-2"
            >
              <option value="1">Disponível</option>
              <option value="2">Ocupado</option>
              <option value="3">Em manutenção</option>
            </select>
          </div>

          {/* Observações */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Observações (opcional)</label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações internas..."
              className="border rounded px-3 py-2 resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Botão Salvar */}
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full bg-[#26c9a8] hover:bg-[#1fa98a] text-white font-semibold py-3 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Apartamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
