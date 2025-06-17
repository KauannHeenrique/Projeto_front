"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import api from "@/services/api";
import {
  Users,
  Home,
  KeyRound,
  AlertCircle,
  UserPlus,
  PlusCircle,
  LogOut,
  CheckCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
  status: "success" | "error";
}

export default function HomeMobile() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [totalApartamentos, setTotalApartamentos] = useState<number>(0);
  const [totalEntradas, setTotalEntradas] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"sindico" | "morador">("sindico");

  const isMorador = user?.nivelAcesso === 4;
  const isSindico = user?.nivelAcesso === 2;

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

        const entradas = await api.get(`/AcessoEntradaMorador/FiltrarEntradasAdmin?dataFim=${hoje}`);
        setTotalEntradas(Array.isArray(entradas.data) ? entradas.data.length : 0);
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
    <>
      <div className="space-y-4">
        <StatCard
          icon={<Home size={20} />}
          label="Meu Apartamento"
          onClick={() => {
            if (user?.apartamentoId) {
              router.push(`/apartamentos/view/${user.apartamentoId}`);
            }
          }}
        />

        <StatCard
          icon={<KeyRound size={20} />}
          label="Entradas hoje"
          onClick={() => router.push(`/accessLog?usuarioId=${user?.usuarioId}`)}
        />

        <StatCard
          icon={<AlertCircle size={20} />}
          label="Alertas ativos"
          value={1}
          onClick={() => router.push("/notificacoes/minhas")}
        />
      </div>

      <div className="space-y-4 pt-4">
        <Link href="/notificacoes/criar">
          <Button className="w-full justify-start gap-3 bg-indigo-600 text-white py-4 text-base">
            <PlusCircle size={20} />
            Criar Notificação
          </Button>
        </Link>

        <Link href="/notificacoes/minhas">
          <Button className="w-full justify-start gap-3 bg-white border text-gray-800 py-4 text-base">
            <FileText size={20} />
            Minhas Notificações
          </Button>
        </Link>
      </div>
    </>
  );

  const renderSindicoView = () => (
    <>
      <div className="space-y-4">
        <StatCard icon={<Users size={20} />} 
        label="Usuários" 
        value={totalUsuarios} 
        onClick={() => router.push("/usuarios")}/>

        <StatCard
          icon={<Home size={20} />}
          label="Apartamentos"
          value={totalApartamentos}
          onClick={() => router.push("/apartamentos")}
        />

        <StatCard
          icon={<KeyRound size={20} />}
          label="Entradas hoje"
          value={totalEntradas}
          onClick={() => router.push("/accessLog")}
        />

        <StatCard icon={<AlertCircle size={20} />} 
        label="Alertas ativos" 
        value={0} 
        onClick={() => router.push("/notification")}
        />
      </div>

      <div className="space-y-4 pt-4">
        <Link href="/notificacoes/validar">
          <Button className="w-full justify-start gap-3 bg-white border text-gray-800 py-4 text-base">
            <CheckCircle size={20} />
            Validar Notificações
          </Button>
        </Link>

        <Link href="/usuarios">
          <Button className="w-full justify-start gap-3 bg-white border text-gray-800 py-4 text-base">
            <UserPlus size={20} />
            Gerenciar Usuários
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="px-4 pt-20 pb-6 max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold mb-1">
            Olá, {user?.nome?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-gray-600">
            {isMorador ? "Morador" : "Síndico"} — Bloco {user?.bloco || "-"}, Ap. {user?.apartamento || "-"}
          </p>
        </div>

        {/* Abas para síndico */}
        {isSindico && (
          <div className="flex justify-between border-b border-gray-300 mb-4">
            <button
              className={`flex-1 py-2 text-sm font-medium ${abaAtiva === "sindico" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600"}`}
              onClick={() => setAbaAtiva("sindico")}
            >
              Síndico
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${abaAtiva === "morador" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600"}`}
              onClick={() => setAbaAtiva("morador")}
            >
              Morador
            </button>
          </div>
        )}

        {isSindico ? (
  <>
    {abaAtiva === "sindico" && renderSindicoView()}
    {abaAtiva === "morador" && renderMoradorView()}
  </>
) : (
  renderMoradorView()
)}


        <div className="pt-6">
          <h2 className="text-base font-semibold mb-3">Atividade Recente</h2>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="bg-white border rounded p-3">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                  <span
                    className={`inline-block px-2 py-1 mt-2 rounded-full text-xs ${
                      activity.status === "success"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
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
      className={`bg-white border rounded-lg p-4 flex items-center justify-between ${
        onClick ? "cursor-pointer hover:bg-gray-100 transition" : ""
      }`}
    >
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {typeof value === "number" && <p className="text-lg font-bold">{value}</p>}
      </div>
      <div className="bg-gray-100 p-2 rounded-full text-gray-600">{icon}</div>
    </div>
  );
}
