"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiSave, FiTrash2 } from "react-icons/fi";
import api from "@/services/api";
import { DeletePopup, EditPopup } from "@/services/popUps";
import { formatCPF, formatCNPJ, formatPhone, cleanDocument } from "@/services/formatValues";

interface FormData {
  nome: string;
  documento: string;
  telefone: string;
  prestadorServico: boolean;
  nomeEmpresa: string;
  cnpj: string;
  status: string; // "ativo" | "inativo"
}

export default function EditVisitor() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    documento: "",
    telefone: "",
    prestadorServico: false,
    nomeEmpresa: "",
    cnpj: "",
    status: "ativo",
  });

  const [mostrarPopupExcluir, setMostrarPopupExcluir] = useState(false);
  const [mostrarPopupSalvar, setMostrarPopupSalvar] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ✅ Carregar dados do visitante
  useEffect(() => {
    const fetchVisitor = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/Visitante/BuscarVisitantePor?id=${id}`);
        const visitante = Array.isArray(data) ? data[0] : data;

        setFormData({
          nome: visitante.nome || "",
          documento: formatCPF(visitante.documento || ""),
          telefone: formatPhone(visitante.telefone || ""),
          prestadorServico: visitante.prestadorServico || false,
          nomeEmpresa: visitante.nomeEmpresa || "",
          cnpj: formatCNPJ(visitante.cnpj || ""),
          status: visitante.status ? "ativo" : "inativo",
        });
      } catch (err: any) {
        const msg = err?.response?.data?.mensagem || "Erro ao carregar visitante.";
        setApiError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchVisitor();
  }, [id]);

  // ✅ Salvar alterações
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);

    const visitanteAtualizado = {
      id: Number(id),
      nome: formData.nome,
      documento: cleanDocument(formData.documento),
      telefone: cleanDocument(formData.telefone),
      prestadorServico: formData.prestadorServico,
      nomeEmpresa: formData.prestadorServico ? formData.nomeEmpresa : null,
      cnpj: formData.prestadorServico ? cleanDocument(formData.cnpj) : null,
      status: formData.status === "ativo",
    };

    try {
      await api.put(`/Visitante/AtualizarVisitante/${id}`, visitanteAtualizado);
      setApiError("Visitante atualizado com sucesso!");
      setTimeout(() => router.push("/users/desktop"), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao atualizar visitante.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Excluir visitante
  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este visitante?")) {
      try {
        await api.delete(`/Visitante/ExcluirVisitante/${id}`);
        setApiError("Visitante excluído com sucesso!");
        setTimeout(() => router.push("/users/desktop"), 1000);
      } catch (err: any) {
        const msg = err?.response?.data?.mensagem || "Erro ao excluir visitante.";
        setApiError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
        <Button
          onClick={() => router.push("/users/desktop")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-700"
        >
          <BsChevronDoubleLeft size={18} /> Voltar
        </Button>

        <div className="flex gap-4">
          <Button
  onClick={() => setMostrarPopupExcluir(true)}
  disabled={isLoading}
  variant="ghost"
  className="text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400"
>
  <FiTrash2 size={16} /> Remover
</Button>

<Button
  type="button"
  onClick={() => setMostrarPopupSalvar(true)}
  disabled={isLoading}
  className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white px-4"
>
  <FiSave size={16} /> {isLoading ? "Salvando..." : "Salvar"}
</Button>

<DeletePopup
  isOpen={mostrarPopupExcluir}
  onClose={() => setMostrarPopupExcluir(false)}
  onConfirm={async () => {
    try {
      setIsLoading(true);
      await api.delete(`/Visitante/ExcluirVisitante/${id}`);
      setApiError("Visitante excluído com sucesso!");
      setMostrarPopupExcluir(false);
      setTimeout(() => router.push("/users/desktop"), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao excluir visitante.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }}
/>

<EditPopup
  isOpen={mostrarPopupSalvar}
  onClose={() => setMostrarPopupSalvar(false)}
  onConfirm={async () => {
    try {
      setIsLoading(true);
      const visitanteAtualizado = {
        id: Number(id),
        nome: formData.nome,
        documento: cleanDocument(formData.documento),
        telefone: cleanDocument(formData.telefone),
        prestadorServico: formData.prestadorServico,
        nomeEmpresa: formData.prestadorServico ? formData.nomeEmpresa : null,
        cnpj: formData.prestadorServico ? cleanDocument(formData.cnpj) : null,
        status: formData.status === "ativo",
      };
      await api.put(`/Visitante/AtualizarVisitante/${id}`, visitanteAtualizado);
      setApiError("Visitante atualizado com sucesso!");
      setMostrarPopupSalvar(false);
      setTimeout(() => router.push("/users/desktop"), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao atualizar visitante.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }}
/>

        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Editar Visitante</h1>

        {apiError && (
          <div className={`mb-4 p-4 rounded ${apiError.includes("sucesso") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {apiError}
          </div>
        )}

        <form id="editVisitorForm" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Documento (CPF)</label>
              <Input
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: formatCPF(e.target.value) })}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.prestadorServico}
                onChange={(e) => setFormData({ ...formData, prestadorServico: e.target.checked })}
                disabled={isLoading}
              />
              É prestador de serviço?
            </label>
          </div>

          {formData.prestadorServico && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da empresa</label>
                <Input
                  placeholder="Nome da empresa"
                  value={formData.nomeEmpresa}
                  onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <Input
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={isLoading}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}
