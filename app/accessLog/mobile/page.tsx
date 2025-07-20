"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiFileText, FiPlus } from "react-icons/fi";
import { Menu, X } from "lucide-react";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCPF } from "@/services/formatValues";
import api from "@/services/api";

interface Acesso {
  id: number;
  nome: string;
  nivelAcesso?: string;
  dataHoraEntrada: string;
  bloco?: string;
  numero?: string;
}

export default function RegistroAcessosMobile() {
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [mostrarPopupRelatorio, setMostrarPopupRelatorio] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"moradores" | "visitantes">("moradores");

  const [modoCombinar, setModoCombinar] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState("nome");
  const [valorFiltro, setValorFiltro] = useState("");
  const [buscou, setBuscou] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroApartamento, setFiltroApartamento] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const [acessos, setAcessos] = useState<Acesso[]>([]);

  const resetFiltros = () => {
    setModoCombinar(false);
    setTipoFiltro("nome");
    setValorFiltro("");
    setFiltroNome("");
    setFiltroDocumento("");
    setFiltroBloco("");
    setFiltroApartamento("");
    setFiltroNivel("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
  };

  const handleChangeAba = (novaAba: "moradores" | "visitantes") => {
    setAbaAtiva(novaAba);
    resetFiltros();
    setAcessos([]);
    setBuscou(false);
    setMensagemErro("");
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatHour = (isoString: string): string => {
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2, "0")}h${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const buscarAcessos = async () => {
    setMensagemErro("");
    if (!modoCombinar) {
  if (tipoFiltro === "dataInicio") {
    if (!filtroDataInicio && !filtroDataFim) {
      setMensagemErro("Por favor, selecione uma data inicial ou final para buscar.");
      return;
    }
  } else if (valorFiltro.trim() === "") {
    setMensagemErro("Por favor, preencha o campo de filtro antes de buscar.");
    return;
  }
}


    setBuscou(true);

    const filtros = modoCombinar
  ? {
      nome: filtroNome,
      documento: filtroDocumento.replace(/\D/g, ""),
      bloco: filtroBloco,
      numero: filtroApartamento,
      nivelAcesso: filtroNivel,
      dataInicio: filtroDataInicio,
      dataFim: filtroDataFim,
    }
  : tipoFiltro === "dataInicio"
  ? {
      dataInicio: filtroDataInicio,
      dataFim: filtroDataFim,
    }
  : {
      [tipoFiltro === "apartamento" ? "numero" : tipoFiltro]:
        tipoFiltro === "documento"
          ? valorFiltro.replace(/\D/g, "")
          : valorFiltro,
    };


    const filtrosLimpos = Object.fromEntries(
      Object.entries(filtros).filter(([_, v]) => v !== "" && v !== undefined)
    );

    const query = new URLSearchParams(filtrosLimpos).toString();

    try {
      const endpoint =
        abaAtiva === "moradores"
          ? "/AcessoEntradaMorador/FiltrarEntradasAdmin"
          : "/AcessoEntradaVisitante/FiltrarEntradasAdmin";

      const response = await api.get(`${endpoint}?${query}`);
      const data = response.data;

      const formatados = data.map((a: any) => ({
        id: a.id,
        nome: a.nome,
        nivelAcesso: a.nivelAcesso,
        dataHoraEntrada: a.dataHoraEntrada,
        bloco: a.bloco || "-",
        numero: a.numero || "-",
      }));

      setAcessos(formatados);
    } catch {
      setAcessos([]);
    }
  };

  const buscarTodos = async () => {
    setMensagemErro("");
    setBuscou(true);
    resetFiltros();

    try {
      const endpoint =
        abaAtiva === "moradores"
          ? "/AcessoEntradaMorador/ListarEntradasMorador"
          : "/AcessoEntradaVisitante/ListarEntradasAdmin";

      const response = await api.get(endpoint);
      const data = response.data;

      const formatados = data.map((a: any) => ({
        id: a.id,
        nome: a.nome,
        nivelAcesso: a.nivelAcesso,
        dataHoraEntrada: a.dataHoraEntrada,
        bloco: a.bloco || "-",
        numero: a.numero || "-",
      }));

      setAcessos(formatados);
    } catch {
      setAcessos([]);
    }
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
                    router.push("/accessLog/mobile/add");
                    setMenuAberto(false);
                  }}
                  className="flex items-center w-full text-left px-2 py-2 text-base font-medium text-gray-700 hover:text-[#26c9a8]"
                >
                  <FiPlus className="h-4 w-4 mr-2" /> Registrar entrada
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

      {/* TABS */}
      <div className="flex w-full border-b">
        <button
          className={`w-1/2 py-2 text-sm font-medium ${
            abaAtiva === "moradores" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"
          }`}
          onClick={() => handleChangeAba("moradores")}
        >
          Moradores
        </button>
        <button
          className={`w-1/2 py-2 text-sm font-medium ${
            abaAtiva === "visitantes" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"
          }`}
          onClick={() => handleChangeAba("visitantes")}
        >
          Visitantes
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white px-4 py-4 border-b shadow-sm space-y-4 rounded-b-md">
        <div className="flex items-center justify-between">
          <select
            value={tipoFiltro}
            onChange={(e) => {
              setTipoFiltro(e.target.value);
              setValorFiltro("");
              setAcessos([]);
              setBuscou(false);
              setMensagemErro("");
            }}
            className="text-sm border rounded px-2 py-1 w-1/2"
          >
            <option value="nome">Nome</option>
            <option value="documento">Documento</option>
            <option value="bloco">Bloco</option>
            <option value="apartamento">Apartamento</option>
            <option value="nivelAcesso">Nível de acesso</option>
            <option value="dataInicio">Data</option>
          </select>

          <Button
            type="button"
            variant={modoCombinar ? "default" : "outline"}
            size="sm"
            onClick={() => setModoCombinar(!modoCombinar)}
            className="text-xs flex items-center gap-1"
          >
            <FaFilter size={12} /> Combinar filtros
          </Button>
        </div>

        {!modoCombinar ? (
  <div className="flex gap-2 w-full">
    {tipoFiltro === "dataInicio" ? (
      <>
        <Input
          type="date"
          value={filtroDataInicio}
          onChange={(e) => setFiltroDataInicio(e.target.value)}
          className="flex-1"
        />
        <Input
          type="date"
          value={filtroDataFim}
          onChange={(e) => setFiltroDataFim(e.target.value)}
          className="flex-1"
        />
      </>
    ) : tipoFiltro === "nivelAcesso" ? (
      <select
        value={valorFiltro}
        onChange={(e) => setValorFiltro(e.target.value)}
        className="w-full border rounded px-2 py-2 text-sm"
      >
        <option value="">Selecione o nível</option>
        <option value="sindico">Síndico</option>
        <option value="funcionario">Funcionário</option>
        <option value="morador">Morador</option>
      </select>
    ) : (
      <Input
        placeholder={
          tipoFiltro === "documento"
            ? "Documento"
            : tipoFiltro.charAt(0).toUpperCase() + tipoFiltro.slice(1)
        }
        value={tipoFiltro === "documento" ? formatCPF(valorFiltro) : valorFiltro}
        onChange={(e) => setValorFiltro(e.target.value)}
        className="flex-1"
      />
    )}
    <Button onClick={buscarAcessos} variant="outline">
      <FaSearch size={14} className="text-black" />
    </Button>
  </div>
) : (
  <div className="space-y-2">
    <Input placeholder="Nome" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
    <Input placeholder="Documento" value={formatCPF(filtroDocumento)} onChange={(e) => setFiltroDocumento(e.target.value)} />
    <Input placeholder="Bloco" value={filtroBloco} onChange={(e) => setFiltroBloco(e.target.value)} />
    <Input placeholder="Apartamento" value={filtroApartamento} onChange={(e) => setFiltroApartamento(e.target.value)} />
    <select
      value={filtroNivel}
      onChange={(e) => setFiltroNivel(e.target.value)}
      className="w-full text-sm border rounded px-2 py-2"
    >
      <option value="">Todos os níveis</option>
      <option value="sindico">Síndico</option>
      <option value="funcionario">Funcionário</option>
      <option value="morador">Morador</option>
    </select>
    <div className="flex gap-2">
      <Input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
      <Input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
    </div>
    <Button onClick={buscarAcessos} variant="outline">
      <FaSearch size={14} className="text-black" />
    </Button>
  </div>
)}


        {/* Botão Exibir Todas */}
        <Button
          onClick={buscarTodos}
          variant="outline"
          className="w-full text-sm mt-2 border-[#167f6c] text-[#167f6c] bg-white hover:bg-[#167f6c15] active:bg-[#167f6c15] focus:bg-[#167f6c15]"
        >
          Exibir todas as entradas
        </Button>

      </div>

      {mensagemErro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 mx-4">{mensagemErro}</div>
      )}

      {/* RESULTADOS */}
      <div className="p-4 space-y-4">
        {buscou && acessos.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-4">Nenhum registro encontrado.</div>
        ) : (
          acessos.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-md border p-4 flex flex-col gap-2">
  {/* Nome */}
  <div className="font-semibold text-base">{a.nome}</div>

 <div className="text-sm text-gray-600">
  <div>
    {abaAtiva === "moradores"
      ? `Nível: ${a.nivelAcesso || "-"}`
      : `Apartamento: ${a.bloco}-${a.numero}`}
  </div>
  <div className="flex items-center gap-1 text-gray-500">
    <span>Data: {formatDate(a.dataHoraEntrada)}</span>
    <span className="text-gray-400">•</span>
    <span>Hora: {formatHour(a.dataHoraEntrada)}</span>
  </div>
</div>


  {/* Botão */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => router.push(`/accessLog/mobile/${a.id}/detalhes`)}
    className="w-fit text-xs"
  >
    Ver detalhes
  </Button>
</div>
          ))
        )}
      </div>

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
              <span className="font-medium">{abaAtiva === "moradores" ? "moradores" : "visitantes"}</span> em formato Excel.
            </p>

            <div className="flex justify-center">
              <Button
                className="bg-[#217346] hover:bg-[#1a5c38] text-white text-sm px-5 py-3 rounded-md w-full font-medium"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `${api.defaults.baseURL}/relatorios/${abaAtiva}`;
                  link.setAttribute("download", `Relatorio_${abaAtiva}.xlsx`);
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
