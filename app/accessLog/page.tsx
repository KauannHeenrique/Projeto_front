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

  const [abaAtiva, setAbaAtiva] = useState<"moradores" | "visitantes">("moradores");

  const [modoCombinarVisitante, setModoCombinarVisitante] = useState(false);
const [filtroTipoVisitante, setFiltroTipoVisitante] = useState("");
const [valorFiltroVisitante, setValorFiltroVisitante] = useState("");

const [filtroNomeVisitante, setFiltroNomeVisitante] = useState("");
const [filtroDocumentoVisitante, setFiltroDocumentoVisitante] = useState("");
const [filtroBlocoVisitado, setFiltroBlocoVisitado] = useState("");
const [filtroAptoVisitado, setFiltroAptoVisitado] = useState("");
const [dataInicioVisitante, setDataInicioVisitante] = useState("");
const [dataFimVisitante, setDataFimVisitante] = useState("");


  const [filtroTipo, setFiltroTipo] = useState("");
  const [valorFiltro, setValorFiltro] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [erros, setErros] = useState<string | null>(null);
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [buscou, setBuscou] = useState(false);
  const [modoCombinar, setModoCombinar] = useState(false);
  const [ordemDataAsc, setOrdemDataAsc] = useState(true);

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroApartamento, setFiltroApartamento] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");

  const formatCPF = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const extrairData = (isoString: string): string => {
    const date = new Date(isoString);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const extrairHora = (isoString: string): string => {
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
      valorFiltro.trim() ||
      filtroNome.trim() ||
      filtroDocumento.trim() ||
      filtroBloco.trim() ||
      filtroApartamento.trim() ||
      filtroNivel.trim() ||
      dataInicio.trim() ||
      dataFim.trim();

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

  const handleBuscarVisitantes = async () => {
  const algumPreenchido =
    valorFiltroVisitante.trim() ||
    filtroNomeVisitante.trim() ||
    filtroDocumentoVisitante.trim() ||
    filtroBlocoVisitado.trim() ||
    filtroAptoVisitado.trim() ||
    dataInicioVisitante.trim() ||
    dataFimVisitante.trim();

  if (!algumPreenchido) {
    setErros("Informe ao menos um parâmetro de busca.");
    return;
  }

  if (dataInicioVisitante && dataFimVisitante) {
    const [d1, m1, y1] = dataInicioVisitante.split("-").map(Number);
    const [d2, m2, y2] = dataFimVisitante.split("-").map(Number);
    const start = new Date(y1, m1 - 1, d1);
    const end = new Date(y2, m2 - 1, d2);
    if (start > end) {
      setErros("A data final não pode ser anterior à data inicial.");
      return;
    }
  }

  setErros(null);
  setBuscou(true);

  try {
    const formatForBackend = (d: string) => {
      const parts = d.split("-");
      return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
    };

    const params = new URLSearchParams();

    if (modoCombinarVisitante) {
      if (filtroNomeVisitante) params.append("nome", filtroNomeVisitante);
      if (filtroDocumentoVisitante) params.append("documento", filtroDocumentoVisitante.replace(/\D/g, ""));
      if (filtroBlocoVisitado) params.append("bloco", filtroBlocoVisitado);
      if (filtroAptoVisitado) params.append("numero", filtroAptoVisitado);
      if (dataInicioVisitante.length === 10) params.append("dataInicio", formatForBackend(dataInicioVisitante));
      if (dataFimVisitante.length === 10) params.append("dataFim", formatForBackend(dataFimVisitante));
    } else {
      if (filtroTipoVisitante === "nome") params.append("nome", valorFiltroVisitante);
      if (filtroTipoVisitante === "documento") params.append("documento", valorFiltroVisitante.replace(/\D/g, ""));
      if (filtroTipoVisitante === "apartamentoVisitado") {
  if (!filtroBlocoVisitado || !filtroAptoVisitado) {
    setErros("Informe o bloco e o apartamento visitado.");
    return;
  }
  params.append("bloco", filtroBlocoVisitado);
  params.append("numero", filtroAptoVisitado);
}

      if (filtroTipoVisitante === "data") {
        if (dataInicioVisitante.length === 10) params.append("dataInicio", formatForBackend(dataInicioVisitante));
        if (dataFimVisitante.length === 10) params.append("dataFim", formatForBackend(dataFimVisitante));
      }
    }

    const response = await fetch(
      `http://172.20.10.2:5263/api/AcessoEntradaVisitante/FiltrarEntradasAdmin?${params.toString()}`
    );
    const dataText = await response.text();
    const data = dataText ? JSON.parse(dataText) : [];
    setAcessos(Array.isArray(data) ? data : []);
  } catch {
    setAcessos([]);
  }
};


  const handleBuscar = async () => {
  if (filtroTipo === "todas") {
    setBuscou(true);
    try {
      const response = await fetch("http://172.20.10.2:5263/api/AcessoEntradaMorador/ListarEntradasMorador");
      const data = await response.json();
      setAcessos(Array.isArray(data) ? data : []);
    } catch {
      setAcessos([]);
    }
    return;
  }

  if (!validarFiltros()) return;
  setBuscou(true);

  try {
    const formatForBackend = (d: string) => {
      const parts = d.split("-");
      if (parts.length !== 3) return "";
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    const params = new URLSearchParams();

    if (modoCombinar) {
      if (filtroApartamento) params.append("numero", filtroApartamento);
      if (filtroBloco) params.append("bloco", filtroBloco);
      if (filtroNome) params.append("nome", filtroNome);
      if (filtroDocumento) params.append("documento", filtroDocumento.replace(/\D/g, ""));
      if (filtroNivel) params.append("nivelAcesso", filtroNivel);
      if (dataInicio.length === 10) params.append("dataInicio", formatForBackend(dataInicio));
      if (dataFim.length === 10) params.append("dataFim", formatForBackend(dataFim));
    } else {
      if (filtroTipo === "data") {
        if (dataInicio.length === 10) params.append("dataInicio", formatForBackend(dataInicio));
        if (dataFim.length === 10) params.append("dataFim", formatForBackend(dataFim));
      } else if (filtroTipo === "nivel") {
        params.append("nivelAcesso", valorFiltro);
      } else if (filtroTipo === "documento") {
        params.append("documento", valorFiltro.replace(/\D/g, ""));
      } else if (filtroTipo === "apartamento") {
        params.append("numero", valorFiltro);
      } else if (filtroTipo === "bloco") {
        params.append("bloco", valorFiltro);
      } else if (filtroTipo === "nome") {
        params.append("nome", valorFiltro);
      }
    }

    const response = await fetch(
      `http://172.20.10.2:5263/api/AcessoEntradaMorador/FiltrarEntradasAdmin?${params.toString()}`
    );
    const dataText = await response.text();
    const data = dataText ? JSON.parse(dataText) : [];
    setAcessos(Array.isArray(data) ? data : []);
  } catch {
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
          const [ano, mes, dia] = raw.split("-");
          setDataInicio(`${dia}-${mes}-${ano}`);
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
          const [ano, mes, dia] = raw.split("-");
          setDataFim(`${dia}-${mes}-${ano}`);
        }}
      />
    </>
  );

  const renderCampoDataVisitante = () => (
  <>
    <Input
      type="date"
      placeholder="Início"
      aria-label="Data de início"
      className={dataInicioVisitante ? "text-black" : "text-gray-500"}
      value={(() => {
        const parts = dataInicioVisitante.split("-");
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dataInicioVisitante;
      })()}
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw) return setDataInicioVisitante("");
        const [ano, mes, dia] = raw.split("-");
        setDataInicioVisitante(`${dia}-${mes}-${ano}`);
      }}
    />
    <Input
      type="date"
      placeholder="Fim"
      aria-label="Data final"
      className={dataFimVisitante ? "text-black" : "text-gray-500"}
      value={(() => {
        const parts = dataFimVisitante.split("-");
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dataFimVisitante;
      })()}
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw) return setDataFimVisitante("");
        const [ano, mes, dia] = raw.split("-");
        setDataFimVisitante(`${dia}-${mes}-${ano}`);
      }}
    />
  </>
);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
        <Button
          type="button"
          onClick={() => router.push("/home")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={16} /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-start gap-4 border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 text-sm font-medium ${abaAtiva === "moradores" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600"}`}
            onClick={() => setAbaAtiva("moradores")}
          >
            Moradores
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${abaAtiva === "visitantes" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600"}`}
            onClick={() => setAbaAtiva("visitantes")}
          >
            Visitantes
          </button>
        </div>

        {abaAtiva === "moradores" && (
          <>
            <div className="flex justify-between items-center mb-6 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold">Registro de Acessos</h1>
              <span className="text-sm text-gray-600">Total de acessos: {totalExibidos}</span>
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

                {filtroTipo === "nome" && (
  <Input
    type="text"
    placeholder="Digite o nome"
    value={valorFiltro}
    onChange={(e) => setValorFiltro(e.target.value)}
    className="col-span-2"
  />
)}

{filtroTipo === "documento" && (
  <Input
    type="text"
    placeholder="Digite o documento"
    value={formatCPF(valorFiltro)}
    onChange={(e) => setValorFiltro(e.target.value)}
    className="col-span-2"
  />
)}

{filtroTipo === "bloco" && (
  <Input
    type="text"
    placeholder="Digite o bloco"
    value={valorFiltro}
    onChange={(e) => setValorFiltro(e.target.value)}
  />
)}

{filtroTipo === "apartamento" && (
  <Input
    type="text"
    placeholder="Digite o apartamento"
    value={valorFiltro}
    onChange={(e) => setValorFiltro(e.target.value)}
  />
)}


{filtroTipoVisitante === "documento" && (
  <Input
    type="text"
    placeholder="Digite o documento"
    value={formatCPF(valorFiltroVisitante)}
    onChange={(e) => setValorFiltroVisitante(e.target.value)}
    className="col-span-2"
  />
)}

{filtroTipoVisitante === "apartamentoVisitado" && (
  <>
    <Input
      type="text"
      placeholder="Bloco"
      value={filtroBlocoVisitado}
      onChange={(e) => setFiltroBlocoVisitado(e.target.value)}
    />
    <Input
      type="text"
      placeholder="Apartamento"
      value={filtroAptoVisitado}
      onChange={(e) => setFiltroAptoVisitado(e.target.value)}
    />
  </>
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
                  <Button onClick={() => setModoCombinar(true)} variant="outline" className="text-xs">
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
                  <Input type="text" placeholder="Nome" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
                  <Input
                    type="text"
                    placeholder="Documento"
                    value={formatCPF(filtroDocumento)}
                    onChange={(e) => setFiltroDocumento(e.target.value.replace(/\D/g, ""))}
                  />
                  <div className="flex gap-2">{renderCampoData()}</div>
                  <Input type="text" placeholder="Bloco" value={filtroBloco} onChange={(e) => setFiltroBloco(e.target.value)} />
                  <Input type="text" placeholder="Apartamento" value={filtroApartamento} onChange={(e) => setFiltroApartamento(e.target.value)} />
                  <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} className="border border-gray-300 rounded px-3 py-2">
                    <option value="">Selecione nível</option>
                    <option value="sindico">Síndico</option>
                    <option value="funcionario">Funcionário</option>
                    <option value="morador">Morador</option>
                  </select>
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
                      <th className="px-4 py-2 text-center cursor-pointer hover:underline" onClick={ordenarPorDataHora}>
                        Data {ordemDataAsc ? "↑" : "↓"}
                      </th>
                      <th className="px-4 py-2 text-center cursor-pointer hover:underline" onClick={ordenarPorDataHora}>
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
          </>
        )}

        {abaAtiva === "visitantes" && (
  <>
    <div className="flex justify-between items-center mb-6 flex-wrap">
      <h1 className="text-xl md:text-2xl font-bold">Acessos de Visitantes</h1>
      <span className="text-sm text-gray-600">Total de acessos: {acessos.length}</span>
    </div>

    {erros && <div className="bg-red-100 text-red-700 p-3 rounded">{erros}</div>}

    {!modoCombinarVisitante ? (
      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <select
          value={filtroTipoVisitante}
          onChange={(e) => setFiltroTipoVisitante(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Selecione um filtro</option>
          <option value="nome">Nome</option>
          <option value="documento">Documento</option>
          <option value="data">Data</option>
          <option value="apartamentoVisitado">Apartamento visitado</option>
        </select>

        {filtroTipoVisitante === "nome" && (
  <Input
    type="text"
    placeholder="Digite o nome"
    value={valorFiltroVisitante}
    onChange={(e) => setValorFiltroVisitante(e.target.value)}
    className="col-span-2"
  />
)}

{filtroTipoVisitante === "documento" && (
  <Input
    type="text"
    placeholder="Digite o documento"
    value={formatCPF(valorFiltroVisitante)}
    onChange={(e) => setValorFiltroVisitante(e.target.value)}
    className="col-span-2"
  />
)}

{filtroTipoVisitante === "data" && renderCampoDataVisitante()}

{filtroTipoVisitante === "apartamentoVisitado" && (
  <>
    <Input
      type="text"
      placeholder="Bloco"
      value={filtroBlocoVisitado}
      onChange={(e) => setFiltroBlocoVisitado(e.target.value)}
    />
    <Input
      type="text"
      placeholder="Apartamento"
      value={filtroAptoVisitado}
      onChange={(e) => setFiltroAptoVisitado(e.target.value)}
    />
  </>
)}


        {filtroTipoVisitante && (
          <Button onClick={() => setModoCombinarVisitante(true)} variant="outline" className="text-xs">
            Combinar filtros
          </Button>
        )}

        <div className="absolute right-0 -bottom-12 md:static md:col-span-1">
          <Button onClick={handleBuscarVisitantes} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <FiSearch size={18} />
          </Button>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Input type="text" placeholder="Nome" value={filtroNomeVisitante} onChange={(e) => setFiltroNomeVisitante(e.target.value)} />
  <Input
    type="text"
    placeholder="Documento"
    value={formatCPF(filtroDocumentoVisitante)}
    onChange={(e) => setFiltroDocumentoVisitante(e.target.value.replace(/\D/g, ""))}
  />
  <div className="flex gap-2">{renderCampoDataVisitante()}</div>

  <Input
    type="text"
    placeholder="Bloco"
    value={filtroBlocoVisitado}
    onChange={(e) => setFiltroBlocoVisitado(e.target.value)}
  />
  <Input
    type="text"
    placeholder="Apartamento"
    value={filtroAptoVisitado}
    onChange={(e) => setFiltroAptoVisitado(e.target.value)}
  />
</div>

        <div className="flex gap-4">
          <Button onClick={handleBuscarVisitantes} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <FiSearch size={18} />
          </Button>
          <Button onClick={() => setModoCombinarVisitante(false)} variant="outline">
            Voltar para filtro único
          </Button>
        </div>
      </div>
    )}

    {!buscou ? (
      <p className="text-gray-500 mt-6">Use os filtros acima para buscar registros de visitantes.</p>
    ) : acessos.length === 0 ? (
      <p className="text-gray-500 mt-6">Nenhum visitante encontrado com os critérios informados.</p>
    ) : (
      <div className="mt-6 overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm text-gray-800">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-center">Data</th>
              <th className="px-4 py-2 text-center">Hora</th>
              <th className="px-4 py-2 text-center">Apartamento visitado</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {acessos.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-2 text-left font-bold">{a.nome}</td>
                <td className="px-4 py-2 text-center">{extrairData(a.dataHoraEntrada)}</td>
                <td className="px-4 py-2 text-center">{extrairHora(a.dataHoraEntrada)}</td>
                <td className="px-4 py-2 text-center">{a.bloco && a.numero ? `${a.bloco}-${a.numero}` : "—"}</td>
                <td className="px-4 py-3 text-center">
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
  </>
)}
      </div>
    </div>
  );
}
