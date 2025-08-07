"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/header";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";
import {
  Users,
  Home,
  KeyRound,
  AlertCircle,
  CheckCircle,
  BellPlusIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/services/loadingScreen";

interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
  status: "success" | "error";
}

export default function HomeMobile() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [alertasAtivos, setAlertasAtivos] = useState<number>(0);

  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [totalApartamentos, setTotalApartamentos] = useState<number>(0);
  const [totalEntradas, setTotalEntradas] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"sindico" | "morador">("sindico");

  const isMorador = Number(user?.nivelAcesso) === 4;
  const isSindico = Number(user?.nivelAcesso) === 2;

  const searchParams = useSearchParams();
  const abaQuery = searchParams.get("aba");

  const [atividadesRecentes, setAtividadesRecentes] = useState<any[]>([]);

  // Verificação de autenticação
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      
      // Verifica se o usuário tem nível de acesso adequado para mobile
      if ([1, 3].includes(Number(user?.nivelAcesso) || 0)) {
        router.push("/home/desktop");
        return;
      }
    }
  }, [user, loading, isAuthenticated, router]);

  // Se ainda está carregando ou não está autenticado, mostra loading
  if (loading || !isAuthenticated) {
    return <LoadingScreen message="Carregando..." />;
  }

  // Se o usuário tem nível de desktop, não renderiza nada (já redirecionou)
  if ([1, 3].includes(Number(user?.nivelAcesso) || 0)) {
    return null;
  }

  useEffect(() => {
  if (!isSindico) {
    setAbaAtiva("morador");
  }
}, [isSindico]);


  useEffect(() => {
    async function fetchData() {
      try {
        const hoje = new Date().toISOString().split("T")[0];

        if (!isMorador) {
          const [usuarios, apartamentos] = await Promise.all([
            api.get("/Usuario/ExibirTodosUsuarios"),
            api.get("/Apartamento/ExibirTodosApartamentos")
          ]);
          setTotalUsuarios(Array.isArray(usuarios.data) ? usuarios.data.length : 0);
          setTotalApartamentos(Array.isArray(apartamentos.data) ? apartamentos.data.length : 0);
        }

        const entradas = await api.get(`/AcessoEntradaMorador/FiltrarEntradasAdmin?dataInicio=${hoje}`);
        setTotalEntradas(Array.isArray(entradas.data) ? entradas.data.length : 0);

        if (user?.usuarioId) {
          const { data: totalAlertas } = await api.get(`/Notificacao/AlertasAtivos/${user.usuarioId}`);
          setAlertasAtivos(totalAlertas);

          // ✅ Buscar atividades recentes
          const { data: atividades } = await api.get(`/Atividades/Recentes/${user.usuarioId}?limite=5`);
          console.log("🔍 Atividades recebidas:", atividades);
          setAtividadesRecentes(atividades);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    if (user) fetchData();
  }, [user]);


  useEffect(() => {
    if (abaQuery === "morador" || abaQuery === "sindico") {
      setAbaAtiva(abaQuery as "morador" | "sindico");
    }
  }, [abaQuery]);

  useEffect(() => {
    async function fetchData() {
      try {
        const hoje = new Date().toISOString().split("T")[0];

        if (!isMorador) {
          const [usuarios, apartamentos] = await Promise.all([
            api.get("/Usuario/ExibirTodosUsuarios"),
            api.get("/Apartamento/ExibirTodosApartamentos")
          ]);
          setTotalUsuarios(Array.isArray(usuarios.data) ? usuarios.data.length : 0);
          setTotalApartamentos(Array.isArray(apartamentos.data) ? apartamentos.data.length : 0);
        }

        if (user?.usuarioId) {
  const { data: totalAlertas } = await api.get(`/Notificacao/AlertasAtivos/${user.usuarioId}`);
  setAlertasAtivos(totalAlertas);
}


      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando dados do usuário...
      </div>
    );
  }

  const renderMoradorView = () => (
    <div className="space-y-4">
      <StatCard
        icon={<Home size={22} />}
        label="Meu Apartamento"
        onClick={() => {
  if (user?.apartamentoId) {
    router.push(`/apartaments/mobile/view/${user.apartamentoId}?aba=morador`);
  }
}}
      />
      <StatCard
        icon={<KeyRound size={22} />}
        label="Entradas hoje"
        onClick={() => router.push(`/accessLog/mobile/user?apartamentoId=${user?.apartamentoId}`)}
      />

      <StatCard
  icon={<AlertCircle size={22} />}
  label="Alertas ativos"
  value={alertasAtivos}
  onClick={() => router.push("/notification/user")}
/>

<StatCard
        icon={<BellPlusIcon size={22} />}
        label="Criar notificação"
        onClick={() => router.push(`/notification/user/create`)}
      />

    </div>
  );

  const renderSindicoView = () => (
    <div className="space-y-4">
      <StatCard
        icon={<Users size={22} />}
        label="Usuários"
        value={totalUsuarios}
        onClick={() => router.push("/users")}
      />

      <StatCard
        icon={<Home size={22} />}
        label="Apartamentos"
        value={totalApartamentos}
        onClick={() => router.push("/apartaments")}
      />

      <StatCard
        icon={<KeyRound size={22} />}
        label="Entradas hoje"
        value={totalEntradas}
        onClick={() => router.push("/accessLog")}
      />

      <StatCard
        icon={<AlertCircle size={22} />}
        label="Alertas ativos"
        value={0}
        onClick={() => router.push("/receiver/alerts")}
      />

      {/* ✅ Novo Card */}
      <StatCard
        icon={<CheckCircle size={22} />}
        label="Validar Notificações"
        onClick={() => router.push("/receiver/approvals")}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="px-4 pt-20 pb-6 max-w-md mx-auto space-y-6">
        {/* Saudação */}
        <div>
          <h1 className="text-xl font-bold mb-1">
            Olá, {user?.nome?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-gray-600">
            {isMorador ? "Morador" : "Síndico"} — Bloco {user?.bloco || "-"}, Apartamento {user?.apartamento || "-"}
          </p>
        </div>

        {/* Abas para síndico */}
        {isSindico && (
          <div className="flex justify-between border-b border-gray-200 mb-4">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                abaAtiva === "sindico"
                  ? "border-b-2 border-[#26c9a8] text-[#26c9a8]"
                  : "text-gray-600"
              }`}
              onClick={() => setAbaAtiva("sindico")}
            >
              Síndico
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                abaAtiva === "morador"
                  ? "border-b-2 border-[#26c9a8] text-[#26c9a8]"
                  : "text-gray-600"
              }`}
              onClick={() => setAbaAtiva("morador")}
            >
              Morador
            </button>
          </div>
        )}

        {/* Conteúdo */}
        {isSindico ? (
          abaAtiva === "sindico" ? renderSindicoView() : renderMoradorView()
        ) : (
          renderMoradorView()
        )}

        {/* Atividade recente */}
        {abaAtiva === "morador" && (

<div className="pt-6">
  <h2 className="text-lg font-bold mb-4 text-gray-800">Atividades Recentes</h2>

  {atividadesRecentes.length === 0 ? (
    <div className="bg-gray-50 border border-dashed rounded-lg p-6 text-center text-gray-500 text-sm">
      Nenhuma atividade registrada ainda.
    </div>
  ) : (
    <div className="relative space-y-6">
      {atividadesRecentes.map((atividade, index) => (
        <div
          key={index}
          onClick={() => {
            if (
              atividade.tipo === "Notificação" ||
              atividade.tipo === "Atualização de Notificação"
            ) {
              router.push(`/notification/user/details/${atividade.referenciaId}`);
            } else if (atividade.tipo === "Entrada") {
              router.push(`/accessLog/mobile/${atividade.referenciaId}/detalhes`);
            }
          }}
          className="bg-white w-full rounded-xl shadow-md p-4 hover:shadow-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
        >
          {/* Cabeçalho com bolinha + label + status */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              {/* Bolinha igual à timeline */}
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  atividade.tipo === "Entrada"
                    ? "border-blue-500 bg-blue-100"
                    : atividade.tipo === "Atualização de Notificação"
                    ? "border-yellow-500 bg-yellow-100"
                    : "border-green-500 bg-green-100"
                }`}
              ></div>

              {/* Texto ao lado da bolinha */}
              <span
                className={`text-sm font-semibold ${
                  atividade.tipo === "Entrada"
                    ? "text-blue-600"
                    : atividade.tipo === "Atualização de Notificação"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {atividade.tipo === "Notificação"
                  ? "Nova notificação"
                  : atividade.tipo === "Atualização de Notificação"
                  ? "Notificação atualizada"
                  : "Registro"}
              </span>
            </div>

            {/* Badge do status */}
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                atividade.status === "Sucesso" ||
                atividade.status === "Aprovada" ||
                atividade.status === "Concluída"
                  ? "bg-green-100 text-green-700"
                  : atividade.status === "Rejeitada"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {atividade.status}
            </span>
          </div>

          {/* Descrição */}
          <p className="text-sm font-semibold text-gray-800 truncate">
            {atividade.descricao}
          </p>

          {/* Data */}
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {new Date(atividade.dataRegistro).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ))}

      <button
        className="w-full mt-4 text-sm font-medium text-[#26c9a8] hover:underline flex justify-center items-center gap-1"
        onClick={() => router.push("/atividades")}
      >
        Ver todas as atividades →
      </button>
    </div>
  )}
</div>
)}

      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-[#f6fefc] transition`}
    >
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {typeof value === "number" && <p className="text-lg font-bold">{value}</p>}
      </div>
      <div className="bg-gray-100 p-2 rounded-full text-gray-600">{icon}</div>
    </div>
  );
}
