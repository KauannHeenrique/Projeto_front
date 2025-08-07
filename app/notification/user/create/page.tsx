"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { BsChevronDoubleLeft } from "react-icons/bs";

const tiposNotificacao = [
  { value: 1, label: "Aviso de barulho" },
  { value: 2, label: "Solicitação de reparo" },
  { value: 3, label: "Sugestão" },
  { value: 4, label: "Outros" },
];

export default function CriarNotificacaoPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroNumero, setFiltroNumero] = useState("");
  const [apartamentoSelecionado, setApartamentoSelecionado] = useState<number | null>(null);
  const [apartamentosSugestoes, setApartamentosSugestoes] = useState<any[]>([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tipo === "1" && filtroBloco && filtroNumero) {
      buscarApartamentos(filtroBloco, filtroNumero);
    }
  }, [tipo, filtroBloco, filtroNumero]);

  const buscarApartamentos = async (bloco: string, numero: string) => {
    if (!bloco || !numero) {
      setApartamentosSugestoes([]);
      return;
    }
    try {
      const { data } = await api.get(`/Apartamento/BuscarPor?bloco=${bloco}&numero=${numero}`);
      setApartamentosSugestoes(data);
    } catch {
      setApartamentosSugestoes([]);
    }
  };

  const criarNotificacao = async () => {
    if (!titulo || !mensagem || !tipo) {
      setMensagemErro("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      let apartamentoId: number | null = null;

      if (tipo === "1") {
        if (!filtroBloco || !filtroNumero) {
          setMensagemErro("Informe bloco e número para enviar o aviso de barulho");
          setLoading(false);
          return;
        }

        const { data } = await api.get(`/Apartamento/BuscarApartamentoPor?bloco=${filtroBloco}&numero=${filtroNumero}`);
        if (!data || data.length === 0) {
          setMensagemErro("Apartamento não encontrado. Verifique bloco e número.");
          setLoading(false);
          return;
        }

        apartamentoId = data[0].id;
      }

      await api.post("/Notificacao/CriarNotificacao", {
        titulo,
        mensagem,
        tipo: parseInt(tipo),
        moradorOrigemId: user?.usuarioId,
        apartamentoDestinoId: tipo === "1" ? apartamentoId : null,
        criadoPorSindico: false,
      });

      setMensagemSucesso("Notificação criada com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 3000);
      router.push("/home/mobile"); // volta para listagem
    } catch (error) {
      console.error(error);
      setMensagemErro("Erro ao criar notificação");
      setTimeout(() => setMensagemErro(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BARRA FIXA NO TOPO */}
      <div className="sticky top-0 bg-white border-b shadow-sm flex items-center px-4 py-3 z-50">
        <Button
            type="button"
            onClick={() => router.push("/home/mobile")}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
          >
            <BsChevronDoubleLeft size={18} /> Voltar
          </Button>
      </div>

      <div className="p-4 space-y-4">
        <h1 className="text-lg font-bold">Criar Notificação</h1>

        {mensagemErro && <div className="bg-red-100 text-red-700 p-2 rounded">{mensagemErro}</div>}
        {mensagemSucesso && <div className="bg-green-100 text-green-700 p-2 rounded">{mensagemSucesso}</div>}

        <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
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
          disabled={loading}
          className="w-full bg-[#26c9a8] text-white"
        >
          {loading ? "Enviando..." : "Criar Notificação"}
        </Button>
      </div>
    </div>
  );
}
