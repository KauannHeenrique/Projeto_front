"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FaSearch, FaFilter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: number;
  status: number;
  dataCriacao: string;
  apartamentoDestino?: { bloco: string; numero: string };
  moradorOrigem?: { nome: string };
}

const tiposNotificacao = [
  { value: 1, label: "Aviso de barulho" },
  { value: 2, label: "Solicitação de reparo" },
  { value: 3, label: "Sugestão" },
  { value: 4, label: "Outros" },
];

const statusOptions = [
  { value: "", label: "Selecione o status" },
  { value: "1", label: "Enviada" },
  { value: "2", label: "Aprovada" },
  { value: "3", label: "Rejeitada" },
  { value: "4", label: "Em andamento" },
  { value: "5", label: "Concluída" },

];

export default function NotificacoesMobile() {
  const router = useRouter();
  const { user } = useAuth();
  const isSindicoOuFuncionario = user?.nivelAcesso === 2 || user?.nivelAcesso === 3;
  
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);

  const statusOptionsAbertas = statusOptions;
  const statusOptionsRecebidas = statusOptions.filter(opt => opt.value !== "3" && opt.value !== "1");

  

  const [abaAtiva, setAbaAtiva] = useState<"abertas" | "recebidas" | "criar">("abertas");
  const [modoCombinar, setModoCombinar] = useState(false);

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(false);

  // --- Mensagens ---
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  // --- Filtros simples ---
  const [filtroCampo, setFiltroCampo] = useState("status");
  const [valorFiltro, setValorFiltro] = useState("");

  // --- Filtros combinados ---
  const [statusFiltro, setStatusFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("7");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // --- Formulário Criar ---
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("");
  const [paraTodos, setParaTodos] = useState(false);
  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroNumero, setFiltroNumero] = useState("");
  const [apartamentoSelecionado, setApartamentoSelecionado] = useState<number | null>(null);
  const [apartamentosSugestoes, setApartamentosSugestoes] = useState<any[]>([]);
  const [loadingCriar, setLoadingCriar] = useState(false);

  useEffect(() => {
  if (!user?.usuarioId) return; // ✅ só chama se tiver ID

  setMostrarNotificacoes(false);
  setNotificacoes([]);
  
}, [abaAtiva, user]);




  // Buscar notificações
  const buscarNotificacoes = async (reset = true) => {
  if (!user?.usuarioId) return; // segurança extra

  try {
    setLoading(true);
    setNotificacoes([]); // limpa antes do fetch
    if (reset) {
      setPagina(1);
      setNotificacoes([]);
    }

    const queryParams: Record<string, string> = {
      page: String(reset ? 1 : pagina),
      pageSize: "30",
    };


    if (modoCombinar) {
      if (statusFiltro) queryParams.status = statusFiltro;
      if (tipoFiltro) queryParams.tipo = tipoFiltro;
      if (periodoFiltro) queryParams.periodo = periodoFiltro;
      if (periodoFiltro === "customizado") {
        if (dataInicio) queryParams.dataInicio = dataInicio;
        if (dataFim) queryParams.dataFim = dataFim;
      }
    } else {
      if (filtroCampo && valorFiltro) {
        queryParams[filtroCampo] = valorFiltro;
      }
    }

    const url =
      abaAtiva === "abertas"
        ? `/Notificacao/MinhasNotificacoes/${user?.usuarioId}`
        : `/Notificacao/Recebidas/${user?.usuarioId}`;

    const { data } = await api.get(url, {
      params: {
        ...queryParams,
        criadoPorSindico: false, // sempre falso no modo morador
      },
    });

    // 🔍 Se estiver na aba RECEBIDAS, filtro para remover pendentes
    let notificacoesFiltradas = data.notificacoes;
      if (abaAtiva === "recebidas") {
  notificacoesFiltradas = notificacoesFiltradas.filter((n: Notificacao) => n.status !== 1 && n.status !== 3);
}



    if (reset) {
      setNotificacoes(notificacoesFiltradas);
    } else {
      setNotificacoes((prev) => [...prev, ...notificacoesFiltradas]);
    }

    setTemMais(notificacoesFiltradas.length === 30);
  } catch (error) {
    console.error("Erro ao buscar notificações", error);
    setNotificacoes([]);
  } finally {
    setLoading(false);
  }
};

  // Exibir todas
  const exibirTodas = () => {
  setModoCombinar(false);
  setFiltroCampo("status");
  setValorFiltro("");
  setStatusFiltro("");
  setTipoFiltro("");
  setPeriodoFiltro("7");
  setDataInicio("");
  setDataFim("");
  setMostrarNotificacoes(true); // agora ativa a listagem
  buscarNotificacoes();
};

  // Buscar apartamentos (Bloco + Número)
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

  useEffect(() => {
    if (tipo === "1" && filtroBloco && filtroNumero) {
      buscarApartamentos(filtroBloco, filtroNumero);
    }
  }, [tipo, filtroBloco, filtroNumero]);

  // Criar notificação
  const criarNotificacao = async () => {
  if (!titulo || !mensagem || !tipo) {
    setMensagemErro("Preencha todos os campos obrigatórios");
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

      // Busca apartamento pelo bloco e número
      const { data } = await api.get(`/Apartamento/BuscarApartamentoPor?bloco=${filtroBloco}&numero=${filtroNumero}`);
      
      if (!data || data.length === 0) {
        setMensagemErro("Apartamento não encontrado. Verifique bloco e número.");
        setLoadingCriar(false);
        return;
      }

      apartamentoId = data[0].id; // Pega o primeiro encontrado
    }

    await api.post("/Notificacao/CriarNotificacao", {
      titulo,
      mensagem,
      tipo: parseInt(tipo),
      moradorOrigemId: user?.usuarioId,
      apartamentoDestinoId: tipo === "1" ? apartamentoId : null, // só quando Aviso de Barulho
      criadoPorSindico: false // ✅ sempre false para morador
    });

    
    setMensagemSucesso("Notificação criada com sucesso!");
    setTimeout(() => setMensagemSucesso(""), 3000);

    // Resetar form
    setAbaAtiva("abertas");
    buscarNotificacoes();
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
      <div className="sticky top-0 bg-white border-b shadow-sm flex items-center px-4 py-3 z-50">
        <Button
          onClick={() => router.push("/home/mobile?aba=morador")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-700"
        >
          <BsChevronDoubleLeft size={18} /> Voltar
        </Button>
      </div>

      {/* Título da Página */}
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Detalhes do apartamento</h1>


      {/* ABAS */}
      <div className="flex justify-between border-b border-gray-200">
        {["abertas", "recebidas", "criar"].map((aba) => (
          <button
            key={aba}
            className={`flex-1 py-2 text-sm font-medium ${abaAtiva === aba ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"}`}
            onClick={() => setAbaAtiva(aba as any)}
          >
            {aba === "abertas" ? "Abertas" : aba === "recebidas" ? "Recebidas" : "Criar"}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* MENSAGENS */}
        {mensagemErro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {mensagemErro}
          </div>
        )}
        {mensagemSucesso && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            {mensagemSucesso}
          </div>
        )}

        {/* FILTRO */}
        {abaAtiva !== "criar" && (
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex justify-between items-center">
              <select
                value={filtroCampo}
                onChange={(e) => {
                  setFiltroCampo(e.target.value);
                  setValorFiltro("");
                }}
                className="border rounded px-2 py-1 text-sm w-1/2"
              >
                <option value="status">Status</option>
                <option value="tipo">Tipo</option>
                <option value="data">Data</option>
              </select>

              <Button
                variant={modoCombinar ? "default" : "outline"}
                size="sm"
                onClick={() => setModoCombinar(!modoCombinar)}
                className="text-xs flex gap-1"
              >
                <FaFilter size={12} /> Combinar filtros
              </Button>
            </div>

            {!modoCombinar ? (
              <div className="flex gap-2">
                {filtroCampo === "status" && (
                  <select
  value={valorFiltro}
  onChange={(e) => setValorFiltro(e.target.value)}
  className="border rounded px-2 py-2 text-sm w-full"
>
  {(abaAtiva === "abertas" ? statusOptionsAbertas : statusOptionsRecebidas).map(opt => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>
                )}

                {filtroCampo === "tipo" && (
                  <select
                    value={valorFiltro}
                    onChange={(e) => setValorFiltro(e.target.value)}
                    className="border rounded px-2 py-2 text-sm w-full"
                  >
                    <option value="">Selecione o tipo</option>
                    {tiposNotificacao.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}

                  </select>
                )}

                {filtroCampo === "data" && (
                  <select
                    value={valorFiltro}
                    onChange={(e) => setValorFiltro(e.target.value)}
                    className="border rounded px-2 py-2 text-sm w-full"
                  >
                    <option value="7">Últimos 7 dias</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="customizado">Personalizado</option>
                  </select>
                )}

                <Button
                  onClick={() => buscarNotificacoes()}
                  size="icon"
                  className="bg-black text-white hover:bg-gray-800 rounded"
                >
                  <FaSearch size={14} />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <label>Status</label>
<select
  value={statusFiltro}
  onChange={(e) => setStatusFiltro(e.target.value)}
  className="border rounded px-2 py-2 text-sm w-full"
>
  {(abaAtiva === "abertas" ? statusOptionsAbertas : statusOptionsRecebidas).map(opt => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>



                <label>Tipo</label>
                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                  className="w-full border rounded px-2 py-2"
                >
                  <option value="">Selecione o tipo</option>
                  {tiposNotificacao.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <label>Período</label>
                <select
                  value={periodoFiltro}
                  onChange={(e) => setPeriodoFiltro(e.target.value)}
                  className="w-full border rounded px-2 py-2"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="customizado">Personalizado</option>
                </select>

                {periodoFiltro === "customizado" && (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                )}

                <Button onClick={() => buscarNotificacoes()}>
                  <FaSearch size={14} />
                </Button>
              </div>
            )}

            <Button
              onClick={exibirTodas}
              variant="outline"
              className="w-full border-[#167f6c] text-[#167f6c] hover:bg-[#167f6c15]"
            >
              Exibir todas as notificações
            </Button>
          </div>
        )}

        {/* LISTAGEM */}
        {abaAtiva !== "criar" && (
          loading ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : (
            <div className="space-y-3">
              {notificacoes.length === 0 ? (
                <p className="text-gray-500 text-center">Nenhuma notificação encontrada.</p>
              ) : (
                notificacoes.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white p-4 rounded-lg border shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                          n.status === 1
                            ? "bg-gray-400 text-black"
                            : n.status === 2
                            ? "bg-green-400  text-black"
                            : n.status === 3
                            ? "bg-red-500 text-black"
                            : n.status === 4
                            ? "bg-yellow-400 text-black"
                            : "bg-green-700 text-black"
                        }`}
                      >
                        {statusOptions.find(s => s.value === String(n.status))?.label}
                      </span>
                    </div>

                    <h2 className="font-semibold uppercase">{n.titulo}</h2>
                    <p className="text-sm text-gray-600">Assunto: {tiposNotificacao.find(t => t.value === n.tipo)?.label}</p>
                    <p className="text-sm text-gray-500">
                      <strong>Data:</strong>{" "}
                      {new Date(n.dataCriacao).toLocaleDateString("pt-BR")}{" "}
                      <strong>Hora:</strong>{" "}
                      {new Date(n.dataCriacao).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/notification/user/details/${n.id}`)}
                      className="w-fit text-xs"
                    >
                      Ver detalhes
                    </Button>
                  </div>
                ))
              )}

              {temMais && (
                <Button
                  onClick={() => {
                    setPagina((p) => p + 1);
                    buscarNotificacoes(false);
                  }}
                  className="w-full bg-[#26c9a8] text-white"
                >
                  Carregar mais
                </Button>
              )}
            </div>
          )
        )}

        {/* FORM CRIAR */}
        {abaAtiva === "criar" && (
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
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
              disabled={loadingCriar}
              className="w-full bg-[#26c9a8] text-white"
            >
              {loadingCriar ? "Enviando..." : "Criar Notificação"}
            </Button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
