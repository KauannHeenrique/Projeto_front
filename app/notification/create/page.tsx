"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";

export default function CriarNotificacaoPage() {
  const { user } = useAuth();
  const [tipo, setTipo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [apartamentoId, setApartamentoId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const tipos = [
    { value: "1", label: "Aviso de barulho" },
    { value: "2", label: "Solicitação de reparo" },
    { value: "3", label: "Sugestão" },
    { value: "4", label: "Outro" },
  ];

  const buscarApartamento = async () => {
  if (!bloco.trim() || !numero.trim()) {
    setFeedback("Informe o bloco e número.");
    return;
  }

  // Limpeza e padronização dos valores antes da requisição
  const blocoLimpo = bloco.trim().toUpperCase();
  const numeroLimpo = numero.trim();

  try {
    const { data } = await api.get("/Apartamento/BuscarApartamentoPor", {
      params: { bloco: blocoLimpo, numero: numeroLimpo }
    });

    if (Array.isArray(data) && data.length > 0) {
      setApartamentoId(data[0].id);
      setFeedback("Apartamento encontrado.");
    } else {
      setApartamentoId(null);
      setFeedback("Apartamento não encontrado.");
    }
  } catch {
    setFeedback("Erro ao buscar apartamento.");
  }
};


  };

  const handleSubmit = async () => {
    if (!tipo || !titulo || !mensagem) {
      setFeedback("Preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      moradorOrigemId: user?.usuarioId,
      tipo: parseInt(tipo),
      titulo,
      mensagem,
      apartamentoDestinoId: tipo === "1" ? apartamentoId : null,
    };

    try {
  const { data } = await api.post("/Notificacao/CriarNotificacao", payload);
  setFeedback("Notificação enviada com sucesso.");
  setTitulo("");
  setMensagem("");
  setTipo("");
  setBloco("");
  setNumero("");
  setApartamentoId(null);
} catch (err: any) {
  const msg = err?.response?.data?.mensagem || "Erro ao enviar.";
  setFeedback(msg);
}

  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Nova Notificação</h1>

      {user && (
        <div className="mb-4 text-sm text-gray-600">
          <strong>Morador:</strong> {user.nome}
        </div>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      >
        <option value="">Selecione</option>
        {tipos.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
      <Input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Resumo da notificação"
        className="mb-4"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
      <Textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Escreva sua mensagem aqui"
        className="mb-4"
      />

      {tipo === "1" && (
        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Destino (Bloco + Número)</label>
          <div className="flex gap-2">
            <Input
              placeholder="Bloco"
              value={bloco}
              onChange={(e) => setBloco(e.target.value)}
            />
            <Input
              placeholder="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
            <Button type="button" onClick={buscarApartamento}>Buscar</Button>
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full bg-indigo-600 text-white mt-2">
        Enviar Notificação
      </Button>

      {feedback && <p className="mt-4 text-sm text-center text-gray-600">{feedback}</p>}
    </div>
  );
}
