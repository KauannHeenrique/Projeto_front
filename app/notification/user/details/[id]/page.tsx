"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { BsChevronDoubleLeft } from "react-icons/bs";

interface Destinatario {
  usuarioId: number;
  nome: string;
  lido: boolean;
}

interface Historico {
  acao: string;
  statusNovo: number;
  dataRegistro: string;
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

  const [showFluxo, setShowFluxo] = useState(false);
  const [showDestinatarios, setShowDestinatarios] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  useEffect(() => {
    if (!id) return;

    const buscarDetalhes = async () => {
      try {
        const { data } = await api.get(`/Notificacao/${id}/detalhes`);
        setNotificacao(data);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="sticky top-0 bg-white border-b shadow-sm flex items-center px-4 py-3 z-50">
        <div className="max-w-4xl mx-auto flex w-full items-center">
          <Button
            type="button"
            onClick={() => router.push("/notification/user")}
            disabled={loading}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
          >
            <BsChevronDoubleLeft size={16} />
            Voltar
          </Button>
          <h1 className="flex-1 text-center font-semibold text-lg">
            Detalhes da Notificação
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna esquerda - status e mensagem */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex justify-between items-center">
            {statusInfo && (
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            )}
            <Button
              className="bg-gray-700 text-white hover:bg-gray-900 px-6 py-2 rounded-full font-medium shadow-md transition"
              onClick={() => setShowFluxo(true)}
            >
              Ver fluxo
            </Button>
          </div>

          <h2 className="text-xl font-bold">{notificacao.titulo}</h2>
          <p className="text-gray-700 mt-2">{notificacao.mensagem}</p>
        </div>

        {/* Coluna direita - infos + acordeões */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4 space-y-2 text-sm text-gray-700">
            <p>
              <strong>Tipo:</strong> {tipoLabel}
            </p>
            <p>
              <strong>Criado em:</strong>{" "}
              {new Date(notificacao.dataCriacao).toLocaleDateString("pt-BR")} às{" "}
              {new Date(notificacao.dataCriacao).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              <strong>Última atualização:</strong> às{" "}
              {new Date(notificacao.ultimaAtualizacao).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Destinatários */}
          <div className="bg-white rounded-lg shadow">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold border-b"
              onClick={() => setShowDestinatarios(!showDestinatarios)}
            >
              Destinatários ({notificacao.destinatarios.length})
              {showDestinatarios ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showDestinatarios && (
              <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                {notificacao.destinatarios.map((d, index) => (
                  <div key={index} className="flex justify-between text-sm border-b pb-1">
                    <span>{d.nome}</span>
                    <span className="relative w-6 h-5 flex items-center justify-center">
                      <Check
                        size={14}
                        className={`absolute ${d.lido ? "text-green-600" : "text-gray-400"} rotate-0`}
                        style={{ transform: "translateX(-3px)" }}
                      />
                      {d.lido && (
                        <Check
                          size={14}
                          className="absolute text-green-600 rotate-0"
                          style={{ transform: "translateX(3px)" }}
                        />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico */}
          <div className="bg-white rounded-lg shadow">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold border-b"
              onClick={() => setShowHistorico(!showHistorico)}
            >
              Histórico ({notificacao.historico.length})
              {showHistorico ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showHistorico && (
              <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                {notificacao.historico.map((h, index) => (
                  <div key={index} className="border-l-4 border-[#26c9a8] pl-2">
                    <p className="text-sm">
                      <strong>Ação:</strong> {h.acao} | <strong>Status:</strong>{" "}
                      {statusOptions.find((s) => s.value === h.statusNovo)?.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(h.dataRegistro).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(h.dataRegistro).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
}
