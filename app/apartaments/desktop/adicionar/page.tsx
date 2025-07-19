"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiSave, FiHelpCircle } from "react-icons/fi";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import api from "@/services/api";

export default function AddApartmentPage() {
  const router = useRouter();
  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [situacao, setSituacao] = useState("disponivel");
  const [observacoes, setObservacoes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setApiError(null);

  const situacaoMap = {
    disponivel: 1,
    ocupado: 2,
    manutencao: 3,
  };

  const body = {
    bloco,
    numero,
    proprietario,
    situacao: situacaoMap[situacao.toLowerCase()] || 1,
    observacoes,
  };

  try {
    const { data } = await api.post("/Apartamento/CadastrarApartamento", body);
    setApiError("Apartamento cadastrado com sucesso!");
    setTimeout(() => router.push("/apartamentos"), 1500);
  } catch (err: any) {
    const msg = err?.response?.data?.mensagem || "Erro ao conectar com a API.";
    setApiError(msg);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Barra fixa */}
        <div className="sticky top-0 z-20 bg-white border-b px-4 sm:px-6 md:px-8 py-2 flex justify-between items-center shadow-sm">
          <Button
            type="button"
            onClick={() => router.push("/apartamentos")}
            disabled={isLoading}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
          >
            <BsChevronDoubleLeft size={16} />
            Voltar
          </Button>

          <Button
            type="submit"
            form="addApartmentForm"
            disabled={isLoading}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
          >
            <FiSave size={16} />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {/* Conteúdo */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Adicionar apartamento</h1>

          {apiError && (
            <div className={`mb-4 p-4 rounded ${apiError.includes("sucesso") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} id="addApartmentForm" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex flex-col w-full sm:w-1/2">
                <label htmlFor="bloco" className="mb-2 font-medium text-gray-700">Bloco</label>
                <Input
                  id="bloco"
                  name="bloco"
                  placeholder="Ex: A"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col w-full sm:w-1/2">
                <label htmlFor="numero" className="mb-2 font-medium text-gray-700">Número</label>
                <Input
                  id="numero"
                  name="numero"
                  placeholder="Ex: 101"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex flex-col w-full sm:w-1/2">
                <label htmlFor="proprietario" className="mb-2 font-medium text-gray-700 flex items-center gap-2">
                  Proprietário
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FiHelpCircle className="text-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-white p-3 rounded-lg shadow-lg max-w-xs transition-all duration-300 transform scale-95 hover:scale-100">
                      O nome do proprietário será registrado como responsável oficial pelo apartamento.
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Input
                  id="proprietario"
                  name="proprietario"
                  placeholder="Nome completo"
                  value={proprietario}
                  onChange={(e) => setProprietario(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col w-full sm:w-1/2">
                <label htmlFor="situacao" className="mb-2 font-medium text-gray-700">Situação</label>
                <select
                  id="situacao"
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value)}
                  disabled={isLoading}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>Disponível</option> 
                  <option value={2}>Ocupado</option> 
                  <option value={3}>Em manutenção</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="observacoes" className="mb-2 font-medium text-gray-700">Observações (opcional)</label>
              <textarea
                id="observacoes"
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações internas sobre o apartamento..."
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500 resize-none"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}
