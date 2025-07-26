"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  KeyRound,
  AlertCircle,
  PlusIcon,
  HomeIcon
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import api from "@/services/api";

interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
  status: "success" | "error";
}

const recentActivities: Activity[] = [];

export default function Home() {
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [totalApartamentos, setTotalApartamentos] = useState<number>(0);
  const [totalEntradas, setTotalEntradas] = useState<number>(0);

const [alertasRecentes, setAlertasRecentes] = useState<any[]>([]);

useEffect(() => {
  const fetchAlertas = async () => {
    try {
      const { data } = await api.get("/Notificacao/AlertasAtivosAdmin");
      if (Array.isArray(data)) {
        setAlertasRecentes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  fetchAlertas();
}, []);



  useEffect(() => {
    async function fetchData() {
      try {
        const [usuariosResponse, apartamentosResponse, entradaResponse] = await Promise.all([
          api.get("/Usuario/ExibirTodosUsuarios"),
          api.get("/Apartamento/ExibirTodosApartamentos"),
          api.get(`/AcessoEntradaMorador/AcessosHojeAdmin`)
        ]);

      const usuariosAtivos = usuariosResponse.data.filter((usuario: any) => usuario.status);

        setTotalUsuarios(usuariosAtivos.length);
        setTotalApartamentos(apartamentosResponse.data.length);
        setTotalEntradas(entradaResponse.data.length);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    fetchData();
  }, []);

const [alertasAtivos, setAlertasAtivos] = useState<number>(0);

useEffect(() => {
  const fetchAlertasAtivos = async () => {
    try {
      const { data } = await api.get("/Notificacao/AlertasAtivosAdmin"); 
      // Se a API retorna uma lista, pegamos o tamanho
      if (Array.isArray(data)) {
        setAlertasAtivos(data.length);
      } else if (typeof data === "number") {
        setAlertasAtivos(data);
      } else {
        console.warn("Formato inesperado da resposta da API:", data);
        setAlertasAtivos(0);
      }
    } catch (error) {
      console.error("Erro ao buscar alertas ativos:", error);
      setAlertasAtivos(0); // fallback
    }
  };

  fetchAlertasAtivos();
}, []);



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="w-full px-12 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de usuários</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsuarios}</div>
              <p className="text-xs text-gray-500">
                {totalUsuarios === 0
                  ? "Nenhum usuário cadastrado"
                  : `${totalUsuarios} usuário(s) cadastrado(s)`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de apartamentos</CardTitle>
              <HomeIcon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApartamentos}</div>
              <p className="text-xs text-gray-500">
                {totalApartamentos === 0
                  ? "Nenhum apartamento cadastrado"
                  : `${totalApartamentos} apartamento(s) cadastrado(s)`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Acessos hoje</CardTitle>
              <KeyRound className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntradas}</div>
              <p className="text-xs text-gray-500">
                {totalEntradas === 0
                  ? "Nenhum acesso registrado"
                  : `${totalEntradas} entrada(s) registrada(s)`}
              </p>
            </CardContent>
          </Card>

          <Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">Alertas ativos</CardTitle>
    <AlertCircle className="h-4 w-4 text-gray-500" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{alertasAtivos}</div>
    <p className="text-xs text-gray-500">
      {alertasAtivos > 0 ? "Alertas ativos no sistema" : "Nenhum alerta ativo"}
    </p>
  </CardContent>
</Card>


        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <Link href="/users/desktop">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Gerenciar usuários</h3>
                    <p className="text-sm text-gray-500">Adicionar, editar ou remover usuários</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <Link href="/apartaments">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <HomeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Gerenciar apartamentos</h3>
                    <p className="text-sm text-gray-500">Adicionar ou editar apartamento</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <Link href="/accessLog">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <PlusIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Gerenciar acessos</h3>
                    <p className="text-sm text-gray-500">Consultar ou registrar entrada</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

       <Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Notificações Recentes</CardTitle>
      <Link
        href="/notificacoes"
        className="text-sm text-blue-600 hover:underline"
      >
        Ver todas
      </Link>
    </div>
  </CardHeader>
  <CardContent>
    {alertasRecentes.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        Nenhuma notificação registrada ainda
      </div>
    ) : (
      <div className="divide-y divide-gray-100">
        {alertasRecentes.slice(0, 5).map((alerta) => (
          <div
            key={alerta.id}
            className="flex items-center justify-between py-4 hover:bg-gray-50 rounded-lg transition"
          >
            {/* Esquerda: Ícone + Título + Data */}
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <p className="font-semibold text-gray-800 truncate max-w-[200px]">
                  {alerta.titulo || "Alerta"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(alerta.dataCriacao).toLocaleDateString("pt-BR")} ·{" "}
                  <span
                    className={`${
                      alerta.status === "Ativo"
                        ? "text-green-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {alerta.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Direita: Botão Ver Detalhes */}
            <Link href={`/notification/admin/details/${alerta.id}`}>
              <Button variant="outline" size="sm">
                Ver detalhes
              </Button>
            </Link>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>

      </main>
    </div>
  );
}
