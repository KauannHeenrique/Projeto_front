"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { formatDateTime } from "@/services/formatValues";

interface Historico {
  acao: string;
  statusNovo: number;
  dataRegistro: string;
  comentario?: string;
}

interface Comentario {
  id: number;
  autor: string;
  texto: string;
  data: string;
}

interface Destinatario {
  usuarioId: number;
  nome: string;
  lido: boolean;
}

interface NotificacaoDetalhe {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: number;
  status: number;
  dataCriacao: string;
  ultimaAtualizacao: string;
  criadoPorSindico: boolean;
  moradorOrigem?: {
    usuarioId: number;
    nome: string;
    bloco?: string;
    apartamento?: number;
  };
  destinatarios: Destinatario[];
  historico: Historico[];
}

const tiposNotificacao = [
  { value: 1, label: "Aviso de barulho" },
  { value: 2, label: "Solicitação de reparo" },
  { value: 3, label: "Sugestão" },
  { value: 4, label: "Outro" },
];

const statusOptions = [
  { value: 1, label: "Enviada", color: "bg-gray-400 text-white" },
  { value: 2, label: "Aprovada", color: "bg-green-400 text-white" },
  { value: 3, label: "Rejeitada", color: "bg-red-500 text-white" },
  { value: 4, label: "Em andamento", color: "bg-yellow-400 text-white" },
  { value: 5, label: "Concluída", color: "bg-green-600 text-white" },
];

export default function NotificacaoDetalhes() {
  const { id } = useParams();
  const router = useRouter();
  const [notificacao, setNotificacao] = useState<NotificacaoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"detalhes" | "comentarios">("detalhes");
  const [comentario, setComentario] = useState("");
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [showDestinatarios, setShowDestinatarios] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFluxo, setShowFluxo] = useState(false);

  const [showAlterarStatus, setShowAlterarStatus] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState<string | null>(null);
  const [comentarioStatus, setComentarioStatus] = useState("");


  const buscarDetalhes = async () => {
    try {
      const { data } = await api.get(`/Notificacao/${id}/detalhes`);
      setNotificacao(data);

      const comentariosResponse = await api.get(`/Notificacao/${id}/comentarios`);
      setComentarios(comentariosResponse.data);
    } catch (error) {
      console.error("Erro ao carregar detalhes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) buscarDetalhes();
  }, [id]);

  const salvarComentario = async () => {
    if (!comentario.trim()) return;

    try {
      setSaving(true);
      await api.put(`/Notificacao/${id}/atualizar`, { comentario });

      // Recarrega os detalhes e comentários
      await buscarDetalhes();

      setComentario("");
    } catch (error) {
      console.error("Erro ao salvar comentário", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando detalhes...</p>;
  if (!notificacao) return <p className="text-center mt-10 text-red-500">Notificação não encontrada.</p>;

  const tipoLabel = tiposNotificacao.find((t) => t.value === notificacao.tipo)?.label;
  const statusInfo = statusOptions.find((s) => s.value === notificacao.status);

  const handleConfirmarStatus = async () => {
  if (!acaoSelecionada) return;

  // Define o status de acordo com a ação
  let novoStatus: number | null = null;
  switch (acaoSelecionada) {
    case "aprovar":
      novoStatus = 2; // Aprovada
      break;
    case "rejeitar":
      novoStatus = 3; // Rejeitada
      break;
    case "em_andamento":
      novoStatus = 4; // Em andamento
      break;
    case "concluir":
      novoStatus = 5; // Concluída
      break;
    case "voltar":
      novoStatus = notificacao?.status === 4 ? 2 : 1; // Voltar para Aprovada ou Enviada
      break;
    default:
      return;
  }

  try {
  await api.put(`/Notificacao/${id}/atualizar`, {
    Status: novoStatus,
    Comentario: comentarioStatus.trim() !== "" ? comentarioStatus : null
  });

  // Limpa os estados ANTES do reload
  setAcaoSelecionada(null);
  setComentarioStatus("");
  setShowAlterarStatus(false);

  // Recarrega detalhes
  await buscarDetalhes();
} catch (error) {
  console.error("Erro ao atualizar status:", error);
}

};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
       <div className="sticky top-0 z-20 bg-white border-b shadow-sm w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <Button
            type="button"
            onClick={() => router.push("/notification/admin/all")}
            disabled={loading}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-xs"
          >
            <BsChevronDoubleLeft size={16} />
            Voltar
          </Button>
          <h1 className="font-semibold text-base text-gray-800">Detalhes da notificação</h1>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto flex">
          <button
            className={`flex-1 py-3 text-center font-semibold ${
              activeTab === "detalhes" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("detalhes")}
          >
            Detalhes
          </button>
          <button
            className={`flex-1 py-3 text-center font-semibold ${
              activeTab === "comentarios" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("comentarios")}
          >
            Comentários
          </button>
        </div>
      </div>

      {/* Conteúdo */}
<div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-10">
  {/* Aba DETALHES */}
  {activeTab === "detalhes" && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Card principal */}
      <div className="bg-white rounded-lg shadow p-4">
        {statusInfo && (
          <span
            className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        )}
        <h2 className="text-lg font-semibold text-gray-900">{notificacao.titulo}</h2>
        <p className="text-gray-700 mt-2 text-sm leading-relaxed">{notificacao.mensagem}</p>

        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <p><strong>Tipo:</strong> {tipoLabel}</p>
          <p>
            <strong>Origem:</strong>{" "}
            {notificacao.moradorOrigem?.nome}
            {notificacao.moradorOrigem?.bloco && notificacao.moradorOrigem?.apartamento
              ? ` (Bloco ${notificacao.moradorOrigem.bloco} - Apartamento ${notificacao.moradorOrigem.apartamento})`
              : ""}
          </p>
          <p><strong>Criado em:</strong> {formatDateTime(notificacao.dataCriacao)}</p>
          <p><strong>Última atualização:</strong> {formatDateTime(notificacao.ultimaAtualizacao)}</p>
        </div>
      </div>

      {/* Card lateral com botão */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
       {/* Cabeçalho com botões */}
<div className="flex justify-between items-center border-b pb-3">
  <h2 className="text-sm font-semibold text-gray-700">Ações rápidas</h2>
  <div className="flex items-center gap-6">
    <Button
      className="bg-orange-500 hover:bg-orange-600 text-white
 px-5 py-2 rounded-full font-medium shadow-md transition"
      onClick={() => setShowAlterarStatus(true)}
    >
      Alterar status
    </Button>
    <Button
      className="bg-gray-700 text-white hover:bg-gray-900 px-5 py-2 rounded-full font-medium shadow-md transition"
      onClick={() => setShowFluxo(true)}
    >
      Ver fluxo
    </Button>
  </div>
</div>


        {/* Accordion Destinatários */}
        <div>
          <button
            className="w-full flex justify-between items-center text-sm font-semibold py-2 border-b"
            onClick={() => setShowDestinatarios(!showDestinatarios)}
          >
            Destinatários ({notificacao.destinatarios.length})
            {showDestinatarios ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={`transition-all duration-300 overflow-hidden ${showDestinatarios ? "max-h-64" : "max-h-0"}`}>
            <div className="p-2 space-y-1 text-xs">
              {notificacao.destinatarios.map((d, i) => (
                <div key={i} className="flex justify-between border-b pb-1">
                  <span>{d.nome}</span>
                  <Check size={14} className={d.lido ? "text-green-500" : "text-gray-300"} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accordion Histórico */}
<div>
  <button
    className="w-full flex justify-between items-center text-sm font-semibold py-2 border-b"
    onClick={() => setShowHistorico(!showHistorico)}
  >
    Histórico ({notificacao.historico.length})
    {showHistorico ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </button>
  <div
  className={`transition-all duration-300 overflow-hidden ${
    showHistorico ? "max-h-64 overflow-y-auto" : "max-h-0"
  }`}
>

    <div className="p-2 space-y-1 text-xs">
      {notificacao.historico.map((h, i) => (
        <div key={i} className="flex flex-col border-b pb-1">
          <p>
            <strong>Status:</strong>{" "}
            {statusOptions.find(s => s.value === h.statusNovo)?.label}
          </p>

          {h.usuarioNome === "" && h.comentario ? (
            <p className="italic">{h.comentario}</p>
          ) : (
            <>
              <p>
                <strong>Atualizado por:</strong> {h.usuarioNome}{" "}
                <span className="text-xs text-gray-500">({h.nivelAcesso})</span>
              </p>
              {h.comentario && (
                <p className="text-xs text-gray-600 mt-1 italic">{h.comentario}</p>
              )}
            </>
          )}

          <p className="text-gray-500 text-xs mt-1">{formatDateTime(h.dataRegistro)}</p>
        </div>
      ))}
    </div>
  </div>
</div>

      </div>
    </div>
  )} 

  {showFluxo && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
              onClick={() => setShowFluxo(false)}
            >
              <X size={24} />
            </button>

            <h2 className="text-lg font-bold mb-6 text-center">Fluxo de Aprovação</h2>

            <div className="flex flex-col items-start text-lg font-semibold text-gray-400 relative">
              <div
                className={`flex items-center gap-2 transition-all duration-500 ${
                  notificacao.status >= 1 ? "text-green-600 animate-fade-in" : ""
                }`}
              >
                ● <span className={notificacao.status === 1 ? "font-bold" : ""}>Enviada</span>
              </div>

              <div
                className={`ml-2 border-l-2 ${
                  notificacao.status > 1 ? "border-green-500" : "border-gray-300"
                } h-5`}
              ></div>

              {notificacao.status === 3 ? (
                <div className="flex items-center gap-2 text-red-500 font-bold">
                  → ● Rejeitada
                </div>
              ) : (
                <>
                  <div
                    className={`flex items-center gap-2 ${
                      notificacao.status >= 2 ? "text-green-600" : ""
                    }`}
                  >
                    ● <span className={notificacao.status === 2 ? "font-bold" : ""}>Aprovada</span>
                  </div>

                  <div
                    className={`ml-2 border-l-2 ${
                      notificacao.status > 2 ? "border-green-500" : "border-gray-300"
                    } h-5`}
                  ></div>

                  <div
                    className={`flex items-center gap-2 ${
                      notificacao.status >= 4 ? "text-green-600" : ""
                    }`}
                  >
                    ● <span className={notificacao.status === 4 ? "font-bold" : ""}>Em andamento</span>
                  </div>

                  <div
                    className={`ml-2 border-l-2 ${
                      notificacao.status > 4 ? "border-green-500" : "border-gray-300"
                    } h-5`}
                  ></div>

                  <div
                    className={`flex items-center gap-2 ${
                      notificacao.status === 5 ? "text-green-600 font-bold" : ""
                    }`}
                  >
                    ● Concluída
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAlterarStatus && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg w-11/12 max-w-md p-6 relative shadow-lg">
      {/* Botão Fechar */}
      <button
        className="absolute top-3 right-3 text-gray-600 hover:text-black"
        onClick={() => setShowAlterarStatus(false)}
      >
        <X size={24} />
      </button>

      {/* Título */}
      <h2 className="text-lg font-bold mb-4 text-center">Alterar Status</h2>

      {(notificacao.status === 3 || notificacao.status === 5) ? (
  <div className="text-center text-red-600 font-medium text-sm py-4">
    {notificacao.status === 3
      ? "Não é possível alterar o status de uma notificação rejeitada."
      : "Não é possível alterar o status de uma notificação concluída."}
  </div>
) : (
  <>
    {/* Comentário */}
    <textarea
      className="w-full border rounded-md p-2 text-sm mb-4"
      placeholder="Adicione um comentário (opcional)"
      value={comentarioStatus}
      onChange={(e) => setComentarioStatus(e.target.value)}
    />

    {/* Botões de ação (dinâmicos) */}
    <div className="flex flex-col gap-3">
      {notificacao.status === 1 && (
        <div className="flex gap-3">
          <Button className="bg-red-600 hover:bg-red-700 text-white flex-1" onClick={() => setAcaoSelecionada("rejeitar")}>
            Rejeitar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => setAcaoSelecionada("aprovar")}>
            Aprovar
          </Button>
        </div>
      )}

      {notificacao.status === 2 && (
        <div className="flex gap-3">
          <Button className="bg-gray-500 hover:bg-gray-600 text-white flex-1" onClick={() => setAcaoSelecionada("voltar")}>
            Voltar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1" onClick={() => setAcaoSelecionada("em_andamento")}>
            Em andamento
          </Button>
        </div>
      )}

      {notificacao.status === 4 && (
        <div className="flex gap-3">
          <Button className="bg-gray-500 hover:bg-gray-600 text-white flex-1" onClick={() => setAcaoSelecionada("voltar")}>
            Voltar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => setAcaoSelecionada("concluir")}>
            Concluir
          </Button>
        </div>
      )}
    </div>
  </>
)}




      {/* Botão Confirmar */}
      <div className="mt-6 flex justify-center gap-2">
        <Button
  className="bg-red-500 hover:bg-red-900 text-white"
          onClick={() => setShowAlterarStatus(false)}
        >
          Cancelar
        </Button>
        <Button
  className="bg-green-500 hover:bg-green-700 text-white"
  disabled={!acaoSelecionada}
  onClick={handleConfirmarStatus}
>
  Confirmar
</Button>
      </div>
    </div>
  </div>
)}


  {/* Aba COMENTÁRIOS */}
  {activeTab === "comentarios" && (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h1 className="font-semibold text-base text-gray-800">Comentários</h1>
      <div>
        <textarea
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Adicionar comentário..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
        <Button className="mt-2" onClick={salvarComentario} disabled={!comentario.trim() || saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="space-y-2">
        {comentarios.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum comentário registrado.</p>
        ) : (
          comentarios.map((c, index) => (
            <div key={c.id || index} className="bg-gray-50 border rounded-md p-2 text-sm">
              <p>
                <strong>{c.autor}</strong>{" "}
                <span className="text-xs text-gray-500">
                  ({formatDateTime(c.data)})
                </span>
              </p>
              <p>{c.texto}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )}
</div>

    </div>
  );
}
