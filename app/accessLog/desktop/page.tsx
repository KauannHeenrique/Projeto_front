  "use client";

  import { useState } from "react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { useRouter } from "next/navigation";
  import { BsChevronDoubleLeft } from "react-icons/bs";
  import { FiPlus, FiSearch, FiFileText, FiUsers } from "react-icons/fi";
  import { formatCPF, cleanDocument, formatDateTime, formatDateOnly, formatTimeBrazil } from "@/services/formatValues";
  import api from "@/services/api"; 
  import { KeyRound } from "lucide-react";
  import { FaFilter, FaSearch } from "react-icons/fa";

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

  const [filtroBlocoUsuario, setFiltroBlocoUsuario] = useState("");

  const [filtroNomeVisitante, setFiltroNomeVisitante] = useState("");
  const [filtroDocumentoVisitante, setFiltroDocumentoVisitante] = useState("");
  const [filtroBlocoVisitado, setFiltroBlocoVisitado] = useState("");
  const [filtroAptoVisitado, setFiltroAptoVisitado] = useState("");
  const [dataInicioVisitante, setDataInicioVisitante] = useState("");
  const [dataFimVisitante, setDataFimVisitante] = useState("");
  const [ordemDataAscVisitante, setOrdemDataAscVisitante] = useState(true);



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

    const ordenarPorDataHoraVisitante = () => {
  const ordenado = [...acessos].sort((a, b) => {
    const dataA = new Date(a.dataEntrada);
    const dataB = new Date(b.dataEntrada);
    return ordemDataAscVisitante
      ? dataA.getTime() - dataB.getTime()
      : dataB.getTime() - dataA.getTime();
  });
  setAcessos(ordenado);
  setOrdemDataAscVisitante(!ordemDataAscVisitante);
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

    

    const buscarTodosMoradores = async () => {
  setBuscou(true);
  try {
    const response = await api.get("/AcessoEntradaMorador/ListarEntradasMorador");
    const data = response.data;
    setAcessos(Array.isArray(data) ? data : []);
  } catch {
    setAcessos([]);
  }
};

const buscarTodosVisitantes = async () => {
  setBuscou(true);
  try {
    const response = await api.get("/AcessoEntradaVisitante/ListarEntradasVisitantes");
    
    const data = response.data;
    setAcessos(Array.isArray(data) ? data : []);
  } catch {
    setAcessos([]);
  }
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
        if (filtroDocumentoVisitante) params.append("documento", cleanDocument(filtroDocumentoVisitante));
        if (filtroBlocoVisitado) params.append("bloco", filtroBlocoVisitado);
        if (filtroAptoVisitado) params.append("numero", filtroAptoVisitado);
        if (dataInicioVisitante.length === 10) params.append("dataInicio", formatForBackend(dataInicioVisitante));
        if (dataFimVisitante.length === 10) params.append("dataFim", formatForBackend(dataFimVisitante));
      } else {
        if (filtroTipoVisitante === "nome") params.append("nome", valorFiltroVisitante);
        if (filtroTipoVisitante === "documento") params.append("documento", cleanDocument(valorFiltroVisitante));
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

      const response = await api.get("/AcessoEntradaVisitante/FiltrarEntradasAdmin", {
    params: Object.fromEntries(params),
  });
  const data = response.data;

      setAcessos(Array.isArray(data) ? data : []);
    } catch {
      setAcessos([]);
    }
  };


    const handleBuscar = async () => {
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
        if (filtroDocumento) params.append("documento", cleanDocument(filtroDocumento));
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
          params.append("documento", cleanDocument(valorFiltro));
       } else if (filtroTipo === "apartamento") {
          if (filtroBlocoUsuario) params.append("bloco", filtroBlocoUsuario);
          if (filtroApartamento) params.append("numero", filtroApartamento);
        } else if (filtroTipo === "bloco") {
          params.append("bloco", valorFiltro);
        } else if (filtroTipo === "nome") {
          params.append("nome", valorFiltro);
        }
      }

      const response = await api.get("/AcessoEntradaMorador/FiltrarEntradasAdmin", {
  params: Object.fromEntries(params),
});
const data = response.data;
      setAcessos(Array.isArray(data) ? data : []);
    } catch {
      setAcessos([]);
    }
  };

    const renderCampoData = () => (
  <div className="col-span-2 grid grid-cols-2 gap-2 w-full">
    <Input
      type="date"
      placeholder="Início"
      aria-label="Data de início"
      value={(() => {
        const parts = dataInicio.split("-");
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dataInicio;
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
      value={(() => {
        const parts = dataFim.split("-");
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dataFim;
      })()}
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw) return setDataFim("");
        const [ano, mes, dia] = raw.split("-");
        setDataFim(`${dia}-${mes}-${ano}`);
      }}
    />
  </div>
);

const renderCampoDataVisitante = () => (
  <div className="col-span-2 grid grid-cols-2 gap-2 w-full">
    <Input
      type="date"
      placeholder="Início"
      aria-label="Data de início"
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
  </div>
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
              onClick={() => router.push("/accessLog/desktop/add")}
              className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white px-3 py-2 text-sm flex items-center gap-2"
            >
              <KeyRound size={16} /> Adicionar Registro
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center gap-4 border-b border-gray-200 mb-6">
  {/* Abas */}
  <div className="flex gap-4">
    <button
      className={`py-2 px-4 text-sm font-medium ${
        abaAtiva === "moradores" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"
      }`}
      onClick={() => {
    setAbaAtiva("moradores");
    setAcessos([]); // 🔑 Limpa os acessos ao trocar aba
    setBuscou(false); // 🔑 Reseta mensagem "nenhum encontrado"
  }}  
    >
      Moradores
    </button>
    <button
      className={`py-2 px-4 text-sm font-medium ${
        abaAtiva === "visitantes" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"
      }`}
      onClick={() => {
    setAbaAtiva("visitantes");
    setAcessos([]); // 🔑 Limpa os acessos ao trocar aba
    setBuscou(false);
  }}
    >
      Visitantes
    </button>
  </div>

  {/* ✅ Botão condicional */}
      <Button
        onClick={() => {
          if (abaAtiva === "moradores") {
            buscarTodosMoradores();
          } else {
            buscarTodosVisitantes();
          }
        }}
        type="button"
        variant="ghost"
        className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
      >
        <FiUsers size={16} />
        {abaAtiva === "moradores" ? "Ver todos os moradores" : "Ver todos os visitantes"}
      </Button>
</div>


          {abaAtiva === "moradores" && (
            <>
              <div className="flex justify-between items-center mb-6 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold">Registro de usuários</h1>
                <span className="text-sm text-gray-600">Total de acessos: {totalExibidos}</span>
              </div>

              {erros && <div className="bg-red-100 text-red-700 p-3 rounded">{erros}</div>}

              {!modoCombinar ? (
                  <div className="flex gap-2 justify-end">

                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Selecione um filtro</option>
                    <option value="nome">Nome</option>
                    <option value="documento">Documento</option>
                    <option value="data">Data</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="nivel">Nível de acesso</option>
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
  <div className="w-full flex flex-col md:flex-row flex-wrap items-end gap-4 justify-start">

    {/* ✅ Novo comportamento para Apartamento */}
      {filtroTipo === "apartamento" && (
        <div className="flex gap-2 w-full">
  <Input
    type="text"
    placeholder="Bloco (opcional)"
    value={filtroBlocoUsuario}
    onChange={(e) => setFiltroBlocoUsuario(e.target.value)}
    className="flex-1"
  />
  <Input
  type="text"
  placeholder="Apartamento (opcional)"
  value={filtroApartamento}
  onChange={(e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    setFiltroApartamento(onlyNumbers);
  }}
  className="flex-1"
/>

</div>

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
      <div className="md:col-span-3">
                          <Input
                            type="text"
                            placeholder="Apartamento"
                            value={filtroApartamento}
                            onChange={(e) => setFiltroApartamento(e.target.value)}
                          />
                        </div>
    </>
  )}

                 {/* Filtro de data para Moradores */}
{filtroTipo === "data" && (
  <div className="col-span-2 grid grid-cols-2 gap-2 w-full">
    <Input
      type="date"
      placeholder="Início"
      value={(() => {
        const parts = dataInicio.split("-");
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dataInicio;
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
      value={(() => {
        const parts = dataFim.split("-");
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dataFim;
      })()}
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw) return setDataFim("");
        const [ano, mes, dia] = raw.split("-");
        setDataFim(`${dia}-${mes}-${ano}`);
      }}
    />
  </div>
)}

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

</div>

                  <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            onClick={() => setModoCombinar(true)}
                            className="text-sm flex items-center gap-1"
                            variant={setModoCombinar ? "outline" : "default"}
                          >
                            <FaFilter size={14} />
                            Combinar filtros
                          </Button>
                  
                          <Button
                            onClick={handleBuscar}
                            className="text-sm flex items-center gap-1 bg-black text-white hover:bg-zinc-800"
                          >
                            <FaSearch size={14} />
                          </Button>
                        </div>
                </div>
              ) : (
                    <div className="space-y-4 mb-6">
  {/* Linha 1: Nome, Documento, Botões */}
  <div className="grid grid-cols-12 gap-4 items-end">
    {/* Nome */}
    <div className="col-span-6">
      <Input
        type="text"
        placeholder="Nome"
        value={filtroNome}
        onChange={(e) => setFiltroNome(e.target.value)}
      />
    </div>

    {/* Documento */}
    <div className="col-span-3">
      <Input
        type="text"
        placeholder="Documento"
        value={formatCPF(filtroDocumento)}
        onChange={(e) =>
          setFiltroDocumento(e.target.value.replace(/\D/g, ""))
        }
      />
    </div>

    {/* Botões */}
    <div className="col-span-3 flex justify-end gap-2">
      <Button
                            type="button"
                            onClick={() => setModoCombinar(false)}
                            className="text-sm flex items-center gap-1"
                            variant={setModoCombinar ? "default" : "outline"}
                          >
                            <FaFilter size={14} />
                            Combinar filtros
                          </Button>
      <Button
        onClick={handleBuscar}
        className="bg-black hover:bg-gray-800 text-white w-12 h-10 flex items-center justify-center"
      >
        <FaSearch size={16} />
      </Button>
    </div>
  </div>

  {/* Linha 2: Bloco, Apartamento, Data início, Data fim */}
  <div className="grid grid-cols-12 gap-4">
    {/* Bloco */}
    <div className="col-span-3">
      <Input
        type="text"
        placeholder="Bloco"
        value={filtroBloco}
        onChange={(e) => setFiltroBloco(e.target.value)}
      />
    </div>

    {/* Apartamento */}
    <div className="col-span-3">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Apartamento"
        value={filtroApartamento}
        onChange={(e) => {
          const onlyNumbers = e.target.value.replace(/\D/g, "");
          setFiltroApartamento(onlyNumbers);
        }}
      />
    </div>

    {/* Data Início */}
    <div className="col-span-3">
      <Input
        type="date"
        value={(() => {
          const parts = dataInicio.split("-");
          return parts.length === 3
            ? `${parts[2]}-${parts[1]}-${parts[0]}`
            : dataInicio;
        })()}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) return setDataInicio("");
          const [ano, mes, dia] = raw.split("-");
          setDataInicio(`${dia}-${mes}-${ano}`);
        }}
      />
    </div>

    {/* Data Fim */}
    <div className="col-span-3">
      <Input
        type="date"
        value={(() => {
          const parts = dataFim.split("-");
          return parts.length === 3
            ? `${parts[2]}-${parts[1]}-${parts[0]}`
            : dataFim;
        })()}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) return setDataFim("");
          const [ano, mes, dia] = raw.split("-");
          setDataFim(`${dia}-${mes}-${ano}`);
        }}
      />
    </div>
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
                          <td className="px-4 py-2 text-center">{formatDateOnly(a.dataHoraEntrada)}</td>
                          <td className="px-4 py-2 text-center">
                            {formatTimeBrazil(a.dataHoraEntrada)}
                          </td>
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" onClick={() => router.push(`/accessLog/desktop/${a.id}/detalhes`)}>
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
        <h1 className="text-xl md:text-2xl font-bold">Registro de visitantes</h1>
        <span className="text-sm text-gray-600">Total de acessos: {acessos.length}</span>
      </div>

      {erros && <div className="bg-red-100 text-red-700 p-3 rounded">{erros}</div>}

      {!modoCombinarVisitante ? (
         <div className="flex gap-2 justify-end">
    <div className="w-full flex flex-col md:flex-row items-end gap-4 justify-between">
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

  {/* Filtro de data para Visitantes */}
{filtroTipoVisitante === "data" && (
  <div className="col-span-2 grid grid-cols-2 gap-2 w-full">
    <Input
      type="date"
      placeholder="Início"
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
  </div>
)}

  {filtroTipoVisitante === "apartamentoVisitado" && (
        <div className="flex gap-2 w-full">
  <Input
    type="text"
    placeholder="Bloco (opcional)"
    value={filtroBlocoVisitado}
    onChange={(e) => setFiltroBlocoVisitado(e.target.value)}
    className="flex-1"
  />
  <Input
  type="text"
  placeholder="Apartamento (opcional)"
  value={filtroAptoVisitado}
  onChange={(e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    setFiltroAptoVisitado(onlyNumbers);
  }}
  className="flex-1"
/>

</div>

      )}
        </div>


          <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            onClick={() => setModoCombinarVisitante(true)}
                            className="text-sm flex items-center gap-1"
                            variant={setModoCombinarVisitante ? "outline" : "default"}
                          >
                            <FaFilter size={14} />
                            Combinar filtros
                          </Button>
                  
                          <Button
                            onClick={handleBuscar}
                            className="text-sm flex items-center gap-1 bg-black text-white hover:bg-zinc-800"
                          >
                            <FaSearch size={14} />
                          </Button>
                        </div>
        </div>
      ) : (
        <div className="space-y-4">
  {/* Primeira linha */}
  <div className="grid grid-cols-12 gap-4 items-end">
    {/* Nome (6 colunas) */}
    <div className="col-span-6">
      <Input
        type="text"
        placeholder="Nome"
        value={filtroNomeVisitante}
        onChange={(e) => setFiltroNomeVisitante(e.target.value)}
      />
    </div>

    {/* Documento (3 colunas) */}
    <div className="col-span-3">
      <Input
        type="text"
        placeholder="Documento"
        value={formatCPF(filtroDocumentoVisitante)}
        onChange={(e) => setFiltroDocumentoVisitante(cleanDocument(e.target.value))}
      />
    </div>

    {/* Botões (2 colunas) */}
    <div className="col-span-3 flex justify-end gap-2">
      <Button
                            type="button"
                            onClick={() => setModoCombinarVisitante(false)}
                            className="text-sm flex items-center gap-1"
                            variant={setModoCombinarVisitante ? "default" : "outline"}
                          >
                            <FaFilter size={14} />
                            Combinar filtros
                          </Button>
      <Button
        onClick={handleBuscarVisitantes}
        className="bg-black hover:bg-gray-800 text-white w-12 h-10 flex items-center justify-center"
      >
        <FaSearch size={16} />
      </Button>
    </div>
  </div>

  {/* Segunda linha */}
  <div className="grid grid-cols-12 gap-4">
    {/* Bloco (3 colunas) */}
    <div className="col-span-3">
      <Input
        type="text"
        placeholder="Bloco"
        value={filtroBlocoVisitado}
        onChange={(e) => setFiltroBlocoVisitado(e.target.value)}
      />
    </div>

    {/* Apartamento (3 colunas) */}
    <div className="col-span-3">
  <Input
    type="text"
    placeholder="Apartamento"
    inputMode="numeric"
    value={filtroAptoVisitado}
    onChange={(e) => {
      const onlyNumbers = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
      setFiltroAptoVisitado(onlyNumbers);
    }}
  />
</div>


    {/* Data Início (3 colunas) */}
    <div className="col-span-3">
      <Input
        type="date"
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
    </div>

    {/* Data Fim (3 colunas) */}
    <div className="col-span-3">
      <Input
        type="date"
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
    </div>
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
    <th className="px-4 py-2 text-left w-1/3">Nome</th>
    <th
      className="px-4 py-2 text-center w-[12%] cursor-pointer hover:underline"
      onClick={ordenarPorDataHoraVisitante}
    >
      Data {ordemDataAscVisitante ? "↑" : "↓"}
    </th>
    <th
      className="px-4 py-2 text-center w-[10%] cursor-pointer hover:underline"
      onClick={ordenarPorDataHoraVisitante}
    >
      Hora {ordemDataAscVisitante ? "↑" : "↓"}
    </th>
    <th className="px-4 py-2 text-center w-[20%]">Apartamento visitado</th>
    <th className="px-4 py-2 text-center w-[4%]">Ações</th>
  </tr>
</thead>


    <tbody>
      {acessos.map((a) => (
        <tr key={a.id} className="border-t hover:bg-gray-50">
          {/* Nome */}
          <td className="px-4 py-2 text-left font-bold">{a.nomeVisitante}</td>

          {/* Data */}
          <td className="px-4 py-2 text-center">{formatDateOnly(a.dataEntrada)}</td>

          {/* Hora */}
          <td className="px-4 py-2 text-center">
            {formatTimeBrazil(a.dataEntrada)}
          </td>
          {/* Apartamento */}
          <td className="px-4 py-2 text-center">
            {a.bloco && a.apartamento ? `${a.bloco}-${a.apartamento}` : "—"}
          </td>

          {/* Botão alinhado à direita */}
          <td className="px-4 py-2 text-right">
            <Button
              size="sm"
              variant="outline"
              className="whitespace-nowrap"
              onClick={() => router.push(`/accessLog/${a.id}/detalhes`)}
            >
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
