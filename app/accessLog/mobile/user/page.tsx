"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import api from "@/services/api";

interface Acesso {
  id: number;
  dataHoraEntrada: string;
  nome?: string;
  bloco: string;
  apartamento: number;
  entradaPor: number; // 1 = Morador, 2 = Visitante
}

export default function UserAccessLog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apartamentoId = searchParams.get("apartamentoId");
  const usuarioId = searchParams.get("usuarioId"); // para visitantes

  const [abaAtiva, setAbaAtiva] = useState<"moradores" | "visitantes">("moradores");
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Dados dinâmicos
  const [acessosMoradores, setAcessosMoradores] = useState<Acesso[]>([]);
  const [acessosVisitantes, setAcessosVisitantes] = useState<Acesso[]>([]);

  // Info para título
  const [bloco, setBloco] = useState("-");
  const [apartamento, setApartamento] = useState("-");

  // Mensagem de erro
  const [mensagemErro, setMensagemErro] = useState("");

  // Função para buscar moradores
  const fetchAcessosMoradores = async () => {
    if (!apartamentoId) return;
    try {
      setLoading(true);
      setMensagemErro("");

      const queryParams: string[] = [];
      if (dataInicio) queryParams.push(`dataInicio=${encodeURIComponent(dataInicio)}`);
      if (dataFim) queryParams.push(`dataFim=${encodeURIComponent(dataFim)}`);
      queryParams.push(`apartamentoId=${encodeURIComponent(apartamentoId)}`);

      const url = `/AcessoEntradaMorador/FiltrarEntradasAdmin?${queryParams.join("&")}`;

      const { data } = await api.get(url);
      setAcessosMoradores(data);

      if (data.length > 0) {
        setBloco(data[0].bloco || "-");
        setApartamento(data[0].apartamento || "-");
      }
    } catch (err) {
      console.error("Erro ao buscar acessos moradores:", err);
      setAcessosMoradores([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar visitantes
const fetchAcessosVisitantes = async () => {
  if (!apartamentoId) return;

  try {
    setLoading(true);
    setMensagemErro("");

    // Monta os parâmetros
    const queryParams: string[] = [`apartamentoId=${encodeURIComponent(apartamentoId)}`];

    if (dataInicio) queryParams.push(`dataInicio=${encodeURIComponent(dataInicio)}`);
    if (dataFim) queryParams.push(`dataFim=${encodeURIComponent(dataFim)}`);

    const url = `/AcessoEntradaVisitante/FiltrarEntradasPorApartamento?${queryParams.join("&")}`;

    const { data } = await api.get(url);
    setAcessosVisitantes(data);

    if (data.length > 0) {
      setBloco(data[0].bloco || "-");
      setApartamento(data[0].apartamento || "-");
    } 
  } catch (err) {
    console.error("Erro ao buscar acessos visitantes:", err);
    setMensagemErro("Erro ao buscar entradas de visitantes.");
    setAcessosVisitantes([]);
  } finally {
    setLoading(false);
  }
};


  // Ação do botão buscar com validação
  const handleBuscar = () => {
    setMensagemErro("");
    if (!dataInicio && !dataFim) {
      setAcessosVisitantes([]);
      setAcessosMoradores([]);
      setMensagemErro("Por favor, preencha pelo menos uma data para buscar.");
      return;
    }

    if (abaAtiva === "moradores") {
      fetchAcessosMoradores();
    } else {
      fetchAcessosVisitantes();
    }
  };

  // Botão exibir todas
  const handleExibirTodas = () => {
    setDataInicio("");
    setDataFim("");
    setMensagemErro("");
    if (abaAtiva === "moradores") {
      fetchAcessosMoradores(); // busca tudo sem filtros
    } else {
      fetchAcessosVisitantes(); // busca tudo
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="sticky top-0 bg-white border-b shadow-sm flex items-center px-4 py-3 z-50">
        <Button
          onClick={() => router.push("/home/mobile?aba=morador")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-700"
        >
          <BsChevronDoubleLeft size={18} /> Voltar
        </Button>

      </div>

      {/* Conteúdo */}
      <div className="px-4 py-4 space-y-6">
        <h1 className="text-lg font-bold">
          Entradas - Bloco {bloco}, Apto {apartamento}
        </h1>

        {/* Barra de filtros */}
        <div className="flex flex-col gap-3">
          {/* Data Início */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Data Início</label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-10 text-sm bg-gray-50 rounded-md border px-3"
            />
          </div>

          {/* Data Fim */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Data Fim</label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-10 text-sm bg-gray-50 rounded-md border px-3"
            />
          </div>

          {/* Botão buscar */}
          <Button
            onClick={handleBuscar}
            className="bg-black hover:bg-gray-800 text-white flex items-center justify-center h-10 rounded-md w-full"
            disabled={loading}
          >
            {loading ? (
              <ImSpinner2 className="animate-spin" size={16} />
            ) : (
              <>
                <FiSearch size={16} className="mr-2" />
                Buscar
              </>
            )}
          </Button>

          {/* Botão exibir todas */}
          <Button
            onClick={handleExibirTodas}
            variant="outline"
            className="w-full text-sm mt-2 border-[#167f6c] text-[#167f6c] bg-white hover:bg-[#167f6c15]"
          >
            Exibir todas as entradas
          </Button>
        </div>

        {/* Mensagem de erro */}
        {mensagemErro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 mx-1">
            {mensagemErro}
          </div>
        )}

        {/* Abas */}
        <div className="flex justify-between border-b border-gray-200 mb-4">
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              abaAtiva === "moradores"
                ? "border-b-2 border-[#26c9a8] text-[#26c9a8]"
                : "text-gray-600"
            }`}
            onClick={() => setAbaAtiva("moradores")}
          >
            Moradores
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              abaAtiva === "visitantes"
                ? "border-b-2 border-[#26c9a8] text-[#26c9a8]"
                : "text-gray-600"
            }`}
            onClick={() => setAbaAtiva("visitantes")}
          >
            Visitantes
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : abaAtiva === "moradores" ? (
          acessosMoradores.length === 0 ? (
            <p className="text-gray-500">Nenhuma entrada encontrada.</p>
          ) : (
            <div className="space-y-3">
              {acessosMoradores.map((a) => (
                <div
                  key={a.id}
                  className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{a.nome || a.nomeVisitante || a.nomeMorador}</p>
                    <p className="text-sm text-gray-500">
                      {a.bloco}-{a.apartamento} |{" "}
                      {new Date(a.dataHoraEntrada).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/accessLog/mobile/user/${a.id}/detalhes`)
                    }
                  >
                    Ver detalhes
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : acessosVisitantes.length === 0 ? (
          <p className="text-gray-500">Nenhum visitante encontrado.</p>
        ) : (
          <div className="space-y-3">
            {acessosVisitantes.map((a) => (
              <div
                key={a.id}
                className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{a.nome || a.nomeVisitante || a.nomeMorador}</p>
                  <p className="text-sm text-gray-500">
                    {a.bloco}-{a.apartamento} |{" "}
                    {new Date(a.dataHoraEntrada).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Detalhes
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
