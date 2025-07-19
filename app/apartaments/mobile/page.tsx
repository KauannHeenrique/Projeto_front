"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiFileText, FiHome } from "react-icons/fi";
import { Menu, X } from "lucide-react";
import { FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

interface Apartamento {
  id: number;
  bloco: string;
  numero: string;
  situacao: number;
}

export default function TelaApartamentosMobile() {
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [mostrarPopupRelatorio, setMostrarPopupRelatorio] = useState(false);

  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);
  const [buscou, setBuscou] = useState(false);

  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroApartamento, setFiltroApartamento] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const paginated = apartamentos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ Buscar com filtros
  const buscarApartamentos = async () => {
    setMensagemErro("");

    if (filtroBloco.trim() === "" && filtroApartamento.trim() === "") {
      setMensagemErro("Preencha ao menos um filtro para buscar.");
      return;
    }

    setBuscou(true);

    const filtros: any = {};
    if (filtroBloco) filtros.bloco = filtroBloco;
    if (filtroApartamento) filtros.numero = filtroApartamento;

    const query = new URLSearchParams(filtros).toString();

    try {
      const response = await api.get(`/Apartamento/BuscarApartamentoPor?${query}`);
      const data = response.data;

      const formatados = data.map((a: any) => ({
        id: a.apartamentoId ?? a.id,
        bloco: a.bloco || "-",
        numero: String(a.numero || "-"),
        situacao: a.situacao,
      }));

      setApartamentos(formatados);
      setCurrentPage(1);
    } catch {
      setApartamentos([]);
    }
  };

  // ✅ Buscar todos
  const buscarTodos = async () => {
    setMensagemErro("");
    setBuscou(true);
    setFiltroBloco("");
    setFiltroApartamento("");

    try {
      const response = await api.get("/Apartamento/ExibirTodosApartamentos");
      const data = response.data;

      const formatados = data.map((a: any) => ({
        id: a.apartamentoId ?? a.id,
        bloco: a.bloco || "-",
        numero: String(a.numero || "-"),
        situacao: a.situacao,
      }));

      setApartamentos(formatados);
      setCurrentPage(1);
    } catch {
      setApartamentos([]);
    }
  };

  const getSituacaoBadge = (situacao: number) => {
    const styles: Record<number, string> = {
      1: "bg-green-500",
      2: "bg-red-500",
      3: "bg-yellow-500",
    };

    const labels: Record<number, string> = {
      1: "Disponível",
      2: "Ocupado",
      3: "Em Manutenção",
    };

    return (
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <span className="font-medium">Situação:</span>
        <span className={`w-2 h-2 rounded-full ${styles[situacao] || "bg-gray-400"}`} />
        {labels[situacao] || "Desconhecido"}
      </div>
    );
  };

  return (
    <>
      {/* HEADER */}
      <div className="sticky top-0 z-50 w-full bg-white shadow-sm border-b px-4 py-2 flex items-center justify-between">
        <Button
          type="button"
          onClick={() => router.push("/home")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={18} /> Voltar
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setMenuAberto(!menuAberto)}>
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {menuAberto && (
            <div className="absolute top-12 right-0 w-64 bg-white shadow-md z-50 rounded border">
              <div className="px-4 py-3 space-y-3">
                <button
                  onClick={() => {
                    router.push("/apartaments/mobile/add");
                    setMenuAberto(false);
                  }}
                  className="flex items-center w-full text-left px-2 py-2 text-base font-medium text-gray-700 hover:text-[#26c9a8]"
                >
                  <FiHome className="h-4 w-4 mr-2" /> Adicionar apartamento
                </button>
                <button
                  onClick={() => {
                    setMostrarPopupRelatorio(true);
                    setMenuAberto(false);
                  }}
                  className="flex items-center w-full text-left px-2 py-2 text-base font-medium text-gray-700 hover:text-[#26c9a8]"
                >
                  <FiFileText className="h-4 w-4 mr-2" /> Gerar relatório
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white px-4 py-4 border-b shadow-sm rounded-b-md">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Bloco"
            value={filtroBloco}
            onChange={(e) => setFiltroBloco(e.target.value)}
          />
          <Input
            placeholder="Apartamento"
            value={filtroApartamento}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
              setFiltroApartamento(onlyNumbers);
            }}
            inputMode="numeric" // Mostra teclado numérico no mobile
            pattern="[0-9]*"    // Restringe a números
          />

          <Button onClick={buscarApartamentos}>
            <FaSearch size={14} />
          </Button>
        </div>

        {/* Botão Exibir Todos */}
        <Button
          onClick={buscarTodos}
          variant="outline"
          className="w-full text-sm mt-2 border-[#167f6c] text-[#167f6c] bg-white hover:bg-[#167f6c15]"
        >
          Exibir todos os apartamentos
        </Button>
      </div>

      {/* MENSAGEM DE ERRO */}
      {mensagemErro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 mx-4">
          {mensagemErro}
        </div>
      )}

      {/* CONTADOR TOTAL */}
      {buscou && (
        <div className="text-gray-700 text-sm px-4 py-2">
          Total: {apartamentos.length} apartamentos
        </div>
      )}

      {/* LISTA */}
      <div className="p-4 space-y-4">
        {paginated.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-xl shadow-md border p-4 flex flex-col gap-2"
          >
            <div className="font-semibold text-base">
              Bloco: {a.bloco} - Apartamento: {a.numero}
            </div>
            {getSituacaoBadge(a.situacao)}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/apartaments/mobile/${a.id}/editar`)}
              className="w-fit text-xs"
            >
              Ver detalhes
            </Button>
          </div>
        ))}

        {buscou && apartamentos.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-4">
            Nenhum apartamento encontrado.
          </div>
        )}
      </div>

      {/* PAGINAÇÃO */}
      {apartamentos.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-4 mt-6 mb-6">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-gray-600">Página {currentPage}</span>
          <Button
            disabled={currentPage * itemsPerPage >= apartamentos.length}
            onClick={() => setCurrentPage((p) => p + 1)}
            variant="outline"
          >
            Próxima
          </Button>
        </div>
      )}

      {/* MODAL RELATÓRIO */}
      {mostrarPopupRelatorio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white relative rounded-lg shadow-lg p-6 w-[90%] max-w-sm">
            <button
              onClick={() => setMostrarPopupRelatorio(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none font-bold"
              aria-label="Fechar"
            >
              ×
            </button>

            <h2 className="text-lg text-center font-semibold mb-4 text-[#217346]">
              Relatório gerado com sucesso
            </h2>

            <p className="text-sm text-center text-gray-700 mb-6">
              Clique no botão abaixo para baixar o relatório de{" "}
              <span className="font-medium">apartamentos</span> em formato Excel.
            </p>

            <div className="flex justify-center">
              <Button
                className="bg-[#217346] hover:bg-[#1a5c38] text-white text-sm px-5 py-3 rounded-md w-full font-medium"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `${api.defaults.baseURL}/relatorios/apartamentos`;
                  link.setAttribute("download", `Relatorio_apartamentos.xlsx`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setMostrarPopupRelatorio(false);
                }}
              >
                Baixar Excel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
