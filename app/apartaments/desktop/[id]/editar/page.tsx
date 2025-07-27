"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiSave, FiTrash2 } from "react-icons/fi";
import api from "@/services/api";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function EditApartmentPage() {
  const router = useRouter();
  const { id } = useParams();

  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [situacao, setSituacao] = useState("1");
  const [observacoes, setObservacoes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchApartamento = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/Apartamento/BuscarApartamentoPorId/${id}`);
setBloco(data.bloco || "");
setNumero(data.numero || "");
setProprietario(data.proprietario || "");
setSituacao(data.situacao?.toString() || "1");
setObservacoes(data.observacoes || "");
      } catch (err) {
        setApiError("Erro ao conectar com a API.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchApartamento();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);

    const body = {
      id: Number(id),
      bloco,
      numero,
      proprietario,
      situacao: Number(situacao),
      observacoes
    };

    try {
      await api.put(`/Apartamento/AtualizarApartamento/${id}`, body);
alert("Apartamento atualizado com sucesso!");
router.push("/apartaments/desktop");

    } catch (err: any) {
      setApiError("Erro ao conectar com a API: " + (err.message || "verifique a URL ou o servidor."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/Apartamento/ExcluirApartamento/${id}`);
alert("Apartamento excluído com sucesso!");
router.push("/apartaments/desktop");

    } catch {
      setApiError("Erro ao conectar com a API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
    {/* Barra fixa */}
    <div className="sticky top-0 z-20 bg-white border-b px-4 sm:px-6 md:px-8 py-2 flex justify-between items-center shadow-sm">
      {/* Botão Voltar */}
      <Button
        type="button"
        onClick={() => router.push("/apartaments/desktop")}
        disabled={isLoading}
        variant="ghost"
        className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
      >
        <BsChevronDoubleLeft size={16} />
        Voltar
      </Button>

      {/* Botões à direita */}
      <div className="flex gap-4">
        <Button
          type="button"
          onClick={handleExcluir}
          disabled={isLoading}
          variant="ghost"
          className="text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1"
        >
          <FiTrash2 size={16} />
          Remover apartamento
        </Button>

        <Button
          type="submit"
          form="editApartmentForm"
          disabled={isLoading}
          className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
        >
          <FiSave size={16} />
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>

    {/* Conteúdo */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Editar apartamento</h1>

      {apiError && (
        <div
          className={`mb-4 p-4 rounded ${
            apiError.includes("sucesso") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} id="editApartmentForm" className="space-y-6">
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
            <label htmlFor="proprietario" className="mb-2 font-medium text-gray-700">Proprietário</label>
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
              <option value="1">Disponível</option>
              <option value="2">Ocupado</option>
              <option value="3">Em manutenção</option>
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
);
}
