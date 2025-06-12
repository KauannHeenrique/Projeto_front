"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiPlus, FiSearch, FiFileText } from "react-icons/fi";


interface Acesso {
  id: number;
  nome: string;
  nivelAcesso: string;
  dataHoraEntrada: string;
}

export default function RegistroAcessosPage() {
  const router = useRouter();
  const [filtroTipo, setFiltroTipo] = useState("");
  const [valorFiltro, setValorFiltro] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [erros, setErros] = useState<string | null>(null);
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [buscou, setBuscou] = useState(false);
  const [modoCombinar, setModoCombinar] = useState(false);
  const [nivelAcesso, setNivelAcesso] = useState("");
  const [ordemDataAsc, setOrdemDataAsc] = useState(true);
  

  const formatCPF = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

      const extrairData = (isoString: string): string => 
        {
          const date = new Date(isoString);
          const dia = String(date.getDate()).padStart(2, "0");
          const mes = String(date.getMonth() + 1).padStart(2, "0");
          const ano = date.getFullYear();
          return `${dia}/${mes}/${ano}`;
        };

      const extrairHora = (isoString: string): string => 
        {
          const date = new Date(isoString);
          const hora = String(date.getHours()).padStart(2, "0");
          const minuto = String(date.getMinutes()).padStart(2, "0");
          return `${hora}h${minuto}`;
        };

        const ordenarPorDataHora = () => {
          const ordenado = [...acessos].sort((a, b) => {
            const dataA = new Date(a.dataHoraEntrada);
            const dataB = new Date(b.dataHoraEntrada);
            return ordemDataAsc ? dataA.getTime() - dataB.getTime() : dataB.getTime() - dataA.getTime();
          });
          setAcessos(ordenado);
          setOrdemDataAsc(!ordemDataAsc);
        };

        const totalExibidos = acessos.length;
        
  const validarFiltros = () => {
    const algumPreenchido =
      valorFiltro.trim() || dataInicio.trim() || dataFim.trim() || nivelAcesso.trim();
    if (!algumPreenchido) {
      setErros("Informe ao menos um parâmetro de busca.");
      return false;
    }

    if (dataInicio && dataFim) {
      const [d1, m1, y1] = dataInicio.split("-").map(Number);
      const [d2, m2, y2] = dataFim.split("-").map(Number);
      const start = new Date(y1, m1 - 1, d1);
      const end = new Date(y2, m2 - 1, d2);
      if (start > end) {
        setErros("A data final não pode ser anterior à data inicial.");
        return false;
      }
    }

    setErros(null);
    return true;
  };

  const handleBuscar = async () => {
  if (filtroTipo === "todas") {
    setBuscou(true);
    try {
      const response = await fetch("http://172.20.10.2:5263/api/AcessoEntradaMorador/ListarEntradasMorador");
      const data = await response.json();
      setAcessos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar todas as entradas:", error);
      setAcessos([]);
    }
    return;
  }

  if (!validarFiltros()) return;
  setBuscou(true);

  try {
    const params = new URLSearchParams();

    const formatForBackend = (d: string) => {
      const parts = d.split("-");
      if (parts.length !== 3) return "";
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    if (modoCombinar) {
      if (["nome", "documento", "bloco", "apartamento"].includes(filtroTipo) && valorFiltro) {
        const raw = filtroTipo === "documento" ? valorFiltro.replace(/\D/g, "") : valorFiltro;
        params.append("filtro", raw);
        params.append("campo", filtroTipo);
      }
      if (dataInicio.length === 10) params.append("dataInicio", formatForBackend(dataInicio));
      if (dataFim.length === 10) params.append("dataFim", formatForBackend(dataFim));
      if (nivelAcesso) params.append("nivelAcesso", nivelAcesso);
    } else {
      if (filtroTipo === "data") {
        if (dataInicio.length === 10) params.append("dataInicio", formatForBackend(dataInicio));
        if (dataFim.length === 10) params.append("dataFim", formatForBackend(dataFim));
      } else if (filtroTipo === "nivel") {
        params.append("nivelAcesso", valorFiltro);
      } else {
        const raw = filtroTipo === "documento" ? valorFiltro.replace(/\D/g, "") : valorFiltro;
        if (raw) {
          params.append("filtro", raw);
          params.append("campo", filtroTipo);
        }
      }
    }

    const response = await fetch(
      `http://172.20.10.2:5263/api/AcessoEntradaMorador/FiltrarEntradasAdmin?${params.toString()}`
    );

    const dataText = await response.text();
    const data = dataText ? JSON.parse(dataText) : [];

    setAcessos(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Erro ao buscar acessos:", error);
    setAcessos([]);
  }
};

  const renderCampoData = () => (
    <>
      <Input
        type="date"
        placeholder="Início"
        aria-label="Data de início"
        className={dataInicio ? "text-black" : "text-gray-500"}
        value={(() => {
          const parts = dataInicio.split("-");
          if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
          return dataInicio;
        })()}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) return setDataInicio("");
          if (raw.length < 10) return setDataInicio(raw);
          const [ano, mes, dia] = raw.split("-");
          const formatada = `${dia}-${mes}-${ano}`;
          setDataInicio(formatada);
        }}
      />
      <Input
        type="date"
        placeholder="Fim"
        aria-label="Data final"
        className={dataFim ? "text-black" : "text-gray-500"}
        value={(() => {
          const parts = dataFim.split("-");
          if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
          return dataFim;
        })()}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) return setDataFim("");
          if (raw.length < 10) return setDataFim(raw);
          const [ano, mes, dia] = raw.split("-");
          const formatada = `${dia}-${mes}-${ano}`;
          setDataFim(formatada);
        }}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
  {/* Botão à esquerda */}
  <Button
    type="button"
    onClick={() => router.push("/home")}
    variant="ghost"
    className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
  >
    <BsChevronDoubleLeft size={16} /> Voltar
  </Button>

  {/* Botões à direita agrupados */}
  <div className="flex items-center gap-2">
    <Button
      type="button"
      variant="ghost"
      className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
    >
      <FiFileText size={16} /> Gerar relatório
    </Button>
    <Button
      onClick={() => router.push("/accessLog/add")}
      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm flex items-center gap-2"
    >
      <FiPlus size={16} /> Adicionar Registro
    </Button>
  </div>
</div>


      {/* Filtros */}
<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6 flex-wrap">
  <h1 className="text-xl md:text-2xl font-bold">Registro de Acessos</h1>
  <span className="text-sm text-gray-600">
    Total de acessos: {totalExibidos}
  </span>
</div>


        {erros && <div className="bg-red-100 text-red-700 p-3 rounded">{erros}</div>}

        {!modoCombinar ? (
          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Selecione um filtro</option>
              <option value="nome">Nome</option>
              <option value="documento">Documento</option>
              <option value="data">Data</option>
              <option value="bloco">Bloco</option>
              <option value="apartamento">Apartamento</option>
              <option value="nivel">Nível de acesso</option>
              <option value="todas">Todas as entradas</option>
            </select>

            {filtroTipo && filtroTipo !== "data" && filtroTipo !== "nivel" && filtroTipo !== "todas" && (
              <Input
                type="text"
                placeholder={`Digite o ${filtroTipo}`}
                value={filtroTipo === "documento" ? formatCPF(valorFiltro) : valorFiltro}
                onChange={(e) => setValorFiltro(e.target.value)}
                className="col-span-2"
              />
            )}

            {filtroTipo === "data" && renderCampoData()}

            {filtroTipo === "nivel" && filtroTipo !== "todas" && (
              <select
                value={valorFiltro}
                onChange={(e) => setValorFiltro(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Selecione</option>
                <option value="sindico">Síndico</option>
                <option value="funcionario">Funcionário</option>
                <option value="morador">Morador</option>
              </select>
            )}

            {filtroTipo && filtroTipo !== "todas" && (
              <Button
                onClick={() => setModoCombinar(true)}
                variant="outline"
                className="text-xs"
              >
                Combinar filtros
              </Button>
            )}

            <div className="absolute right-0 -bottom-12 md:static md:col-span-1">
              <Button onClick={handleBuscar} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <FiSearch size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="text"
                placeholder="Nome"
                value={filtroTipo === "nome" ? valorFiltro : ""}
                onChange={(e) => {
                  setFiltroTipo("nome");
                  setValorFiltro(e.target.value);
                }}
              />
              <Input
  type="text"
  placeholder="Documento"
  value={filtroTipo === "documento" ? formatCPF(valorFiltro) : valorFiltro}
  onChange={(e) => {
    setFiltroTipo("documento");
    setValorFiltro(e.target.value);
  }}
/>
              <select
                value={nivelAcesso}
                onChange={(e) => setNivelAcesso(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Selecione nível</option>
                <option value="sindico">Síndico</option>
                <option value="funcionario">Funcionário</option>
                <option value="morador">Morador</option>
              </select>
              <Input
                type="text"
                placeholder="Bloco"
                value={filtroTipo === "bloco" ? valorFiltro : ""}
                onChange={(e) => {
                  setFiltroTipo("bloco");
                  setValorFiltro(e.target.value);
                }}
              />
              <Input
                type="text"
                placeholder="Apartamento"
                value={filtroTipo === "apartamento" ? valorFiltro : ""}
                onChange={(e) => {
                  setFiltroTipo("apartamento");
                  setValorFiltro(e.target.value);
                }}
              />
              <div className="flex gap-2">{renderCampoData()}</div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleBuscar} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <FiSearch size={18} />
              </Button>
              <Button onClick={() => setModoCombinar(false)} variant="outline">
                Voltar para filtro único
              </Button>
            </div>
          </div>
        )}

        {/* Resultados */}
        {!buscou ? (
          <p className="text-gray-500 mt-6">Use os filtros acima para buscar registros de acesso.</p>
        ) : acessos.length === 0 ? (
          <p className="text-gray-500 mt-6">Nenhum acesso encontrado com os critérios informados.</p>
        ) : (
          <div className="mt-6 overflow-x-auto bg-white rounded shadow">
            <table className="w-full text-sm text-gray-800">
              <thead className="bg-gray-100">
  <tr>
    <th className="px-4 py-2 text-left">Nome</th>
    <th className="px-4 py-2 text-center">Nível de acesso</th>
    <th
      className="px-4 py-2 text-center cursor-pointer hover:underline"
      onClick={ordenarPorDataHora}
    >
      Data {ordemDataAsc ? "↑" : "↓"}
    </th>
    <th
      className="px-4 py-2 text-center cursor-pointer hover:underline"
      onClick={ordenarPorDataHora}
    >
      Hora {ordemDataAsc ? "↑" : "↓"}
    </th>
    <th className="px-4 py-3 text-center">Ações</th>
  </tr>
</thead>

              <tbody>
                {acessos.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2 text-left font-bold">{a.nome}</td>
                    <td className="px-4 py-2 capitalize text-center">{a.nivelAcesso}</td>
                    <td className="px-4 py-2 text-center">{extrairData(a.dataHoraEntrada)}</td>
                    <td className="px-4 py-2 text-center">{extrairHora(a.dataHoraEntrada)}</td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/accessLog/${a.id}/detalhes`)}>
                        Ver detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
