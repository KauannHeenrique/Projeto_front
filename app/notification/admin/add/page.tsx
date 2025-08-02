"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

const tiposNotificacao = [
  { value: 1, label: "Aviso de barulho" },
  { value: 2, label: "Solicitação de reparo" },
  { value: 3, label: "Sugestão" },
  { value: 4, label: "Outros" },
  { value: 5, label: "Aviso geral" }, 
];

export default function CriarNotificacaoDesktop() {
  const router = useRouter();
  const { user } = useAuth();

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroNumero, setFiltroNumero] = useState("");
  const [apartamentosSugestoes, setApartamentosSugestoes] = useState<any[]>([]);
  const [apartamentoSelecionado, setApartamentoSelecionado] = useState<number | null>(null);
  const [loadingCriar, setLoadingCriar] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");



  const criarNotificacao = async () => {
    if (!titulo || !mensagem || !tipo) {
      setMensagemErro("Preencha todos os campos obrigatórios");
      setTimeout(() => setMensagemErro(""), 3000);
      return;
    }

    try {
      setLoadingCriar(true);

      let apartamentoId: number | null = null;

      if (tipo === "1") {
        if (!filtroBloco || !filtroNumero) {
          setMensagemErro("Informe bloco e número para enviar o aviso de barulho");
          setLoadingCriar(false);
          return;
        }
      }

      await api.post("/Notificacao/CriarNotificacao", {
        titulo,
        mensagem,
        tipo: parseInt(tipo),
        moradorOrigemId: user?.usuarioId,
        criadoPorSindico: false,
        bloco: filtroBloco,
        numero: filtroNumero,
      });

      setMensagemSucesso("Notificação criada com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 3000);

      // Resetar formulário
      setTitulo("");
      setMensagem("");
      setTipo("");
      setFiltroBloco("");
      setFiltroNumero("");
      setApartamentoSelecionado(null);
      setApartamentosSugestoes([]);
    } catch (error) {
      console.error(error);
      setMensagemErro("Erro ao criar notificação");
      setTimeout(() => setMensagemErro(""), 3000);
    } finally {
      setLoadingCriar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 bg-white border-b shadow-sm flex items-center px-6 py-4 z-50">
        <Button
          onClick={() => router.push("/home/desktop")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-700"
        >
          <BsChevronDoubleLeft size={18} /> Voltar
        </Button>
        <h1 className="text-lg font-semibold ml-4">Criar Notificação</h1>
      </div>

      {/* FORMULÁRIO */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Mensagens */}
          {mensagemErro && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{mensagemErro}</div>}
          {mensagemSucesso && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">{mensagemSucesso}</div>}

          <Input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            placeholder="Mensagem"
            rows={4}
            className="border rounded px-2 py-2 w-full text-sm"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border rounded px-2 py-2 text-sm w-full"
          >
            <option value="">Selecione o tipo</option>
            {tiposNotificacao.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {tipo === "1" && (
            <div className="flex gap-2">
              <Input
                placeholder="Bloco"
                value={filtroBloco}
                onChange={(e) => setFiltroBloco(e.target.value)}
              />
              <Input
                placeholder="Apartamento"
                value={filtroNumero}
                onChange={(e) => setFiltroNumero(e.target.value)}
              />
            </div>
          )}

          {apartamentosSugestoes.length > 0 && tipo === "1" && (
            <ul className="border rounded mt-2 bg-white max-h-32 overflow-auto">
              {apartamentosSugestoes.map((apt) => (
                <li
                  key={apt.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setApartamentoSelecionado(apt.id);
                    setFiltroBloco(apt.bloco);
                    setFiltroNumero(apt.numero);
                    setApartamentosSugestoes([]);
                  }}
                >
                  Bloco {apt.bloco}, Ap {apt.numero}
                </li>
              ))}
            </ul>
          )}

          <Button
            onClick={criarNotificacao}
            disabled={loadingCriar}
            className="w-full bg-[#26c9a8] text-white hover:bg-[#1fa78b]"
          >
            {loadingCriar ? "Enviando..." : "Criar Notificação"}
          </Button>
        </div>
      </div>
    </div>
  );
}
