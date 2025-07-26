"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { BsChevronDoubleLeft } from "react-icons/bs";

interface Historico {
  acao: string;
  statusNovo: number;
  dataRegistro: string;
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

interface ApartamentoInfo {
  bloco: string;
  numero: string;
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
    apartamentoId?: number;
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
  const [apartamentoInfo, setApartamentoInfo] = useState<ApartamentoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"detalhes" | "comentarios">("detalhes");
  const [showFluxo, setShowFluxo] = useState(false);

  const [comentario, setComentario] = useState("");
  const [comentarios, setComentarios] = useState<Comentario[]>([
    { id: 1, autor: "João", texto: "Verificado, aguardando peça.", data: "25/07/2025 14:00" },
    { id: 2, autor: "Maria", texto: "Peça chegou, agendando reparo.", data: "26/07/2025 10:30" },
  ]);

  const [showDestinatarios, setShowDestinatarios] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  useEffect(() => {
    if (!id) return;

    const buscarDetalhes = async () => {
      try {
        const { data } = await api.get(`/Notificacao/${id}/detalhes`);
        setNotificacao(data);

        if (data?.moradorOrigem?.apartamentoId) {
          const aptResponse = await api.get(`/Apartamentos/${data.moradorOrigem.apartamentoId}`);
          setApartamentoInfo(aptResponse.data);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes", error);
      } finally {
        setLoading(false);
      }
    };

    buscarDetalhes();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Carregando detalhes...</p>;

  if (!notificacao)
    return <p className="text-center mt-10 text-red-500">Notificação não encontrada.</p>;

  const tipoLabel = tiposNotificacao.find((t) => t.value === notificacao.tipo)?.label;
  const statusInfo = statusOptions.find((s) => s.value === notificacao.status);

  const salvarComentario = () => {
    if (!comentario.trim()) return;
    const novo: Comentario = {
      id: comentarios.length + 1,
      autor: "Funcionário Atual",
      texto: comentario,
      data: new Date().toLocaleString("pt-BR"),
    };
    // Comentário mais recente primeiro
    setComentarios((prev) => [novo, ...prev]);
    setComentario("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b shadow-sm px-4 py-2 z-50">
        <div className="flex-1 max-w-6xl mx-auto flex justify-between items-center">
          <Button
            type="button"
            onClick={() => router.push("/home/desktop")}
            disabled={loading}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-xs"
          >
            <BsChevronDoubleLeft size={16} />
            Voltar
          </Button>
          <h1 className="font-semibold text-base text-gray-800">Detalhes da Notificação</h1>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Abas */}
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
                  <strong>Origem:</strong> {notificacao.moradorOrigem?.nome}{" "}
                  {apartamentoInfo && `(${apartamentoInfo.bloco} - ${apartamentoInfo.numero})`}
                </p>
                <p>
                  <strong>Criado em:</strong>{" "}
                  {new Date(notificacao.dataCriacao).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(notificacao.dataCriacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p>
                  <strong>Última atualização:</strong>{" "}
                  {new Date(notificacao.ultimaAtualizacao).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(notificacao.ultimaAtualizacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Card lateral com botões + acordeons */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
              {/* Botões */}
              <div className="flex flex-col gap-2 mb-4">
                <Button className="bg-gray-800 text-white hover:bg-gray-900" onClick={() => setShowFluxo(true)}>
                  Ver fluxo e alterar status
                </Button>
                <Button variant="secondary">Marcar como lida</Button>
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
                <div className={`transition-all duration-300 overflow-hidden ${showHistorico ? "max-h-64" : "max-h-0"}`}>
                  <div className="p-2 space-y-2 text-xs">
                    {notificacao.historico.length === 0 ? (
                      <p className="text-gray-500">Nenhum histórico disponível.</p>
                    ) : (
                      notificacao.historico.map((h, i) => (
                        <div key={i} className="border-l-4 border-green-400 pl-2">
                          <p><strong>{h.acao}</strong> - {statusOptions.find((s) => s.value === h.statusNovo)?.label}</p>
                          <p className="text-gray-500">{new Date(h.dataRegistro).toLocaleString("pt-BR")}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
              <Button className="mt-2" onClick={salvarComentario} disabled={!comentario.trim()}>
                Salvar
              </Button>
            </div>

            <div className="space-y-2">
              {comentarios.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum comentário registrado.</p>
              ) : (
                comentarios.map((c) => (
                  <div key={c.id} className="bg-gray-50 border rounded-md p-2 text-sm">
                    <p><strong>{c.autor}</strong> <span className="text-xs text-gray-500">({c.data})</span></p>
                    <p>{c.texto}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Fluxo */}
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
          </div>
        </div>
      )}
    </div>
  );
}
