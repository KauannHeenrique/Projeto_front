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
      } catch {
        setApiError("Erro ao carregar informações do apartamento.");
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
      observacoes,
    };

    try {
      await api.put(`/Apartamento/AtualizarApartamento/${id}`, body);
      alert("Apartamento atualizado com sucesso!");
      router.push("/apartaments");
    } catch (err: any) {
      setApiError("Erro ao atualizar: " + (err.message || "verifique o servidor."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/Apartamento/ExcluirApartamento/${id}`);
      alert("Apartamento excluído com sucesso!");
      router.push("/apartaments");
    } catch {
      setApiError("Erro ao excluir apartamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center">
        {/* Voltar */}
        <Button
          type="button"
          onClick={() => router.push("/apartaments")}
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
        <h1 className="text-xl font-bold mb-4">Editar Apartamento</h1>

        {/* Mensagem de erro */}
        {apiError && (
          <div className="bg-red-100 text-red-700 border border-red-400 rounded px-4 py-2 mb-4">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} id="editApartmentForm" className="space-y-4">
          {/* Bloco e Número */}
          <div className="flex gap-2">
            <div className="flex flex-col w-1/2">
              <label className="text-sm mb-1">Bloco</label>
              <Input value={bloco} onChange={(e) => setBloco(e.target.value)} disabled={isLoading} />
            </div>
            <div className="flex flex-col w-1/2">
              <label className="text-sm mb-1">Número</label>
              <Input
                type="number"
                inputMode="numeric"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                disabled={isLoading}
              />

            </div>
          </div>

          {/* Proprietário */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Proprietário</label>
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
            <label className="text-sm mb-1">Observações</label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="border rounded px-3 py-2 resize-none"
              placeholder="Anotações internas..."
            />
          </div>

          {/* Botões no final do formulário */}
          <div className="mt-6 space-y-2">
            <Button
              type="submit"
              className="w-full bg-[#26c9a8] hover:bg-[#1fa98a] text-white font-semibold py-3 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-red-500 text-red-600 hover:bg-red-100"
                  disabled={isLoading}
                >
                  <FiTrash2 size={16} /> Remover Apartamento
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este apartamento? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleExcluir} className="bg-red-500 hover:bg-red-600 text-white">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </div>
    </div>
  );
}
