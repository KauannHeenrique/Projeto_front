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

  useEffect(() => {
    async function fetchData() {
      try {
        const hoje = new Date().toISOString().split("T")[0];

        const [usuariosResponse, apartamentosResponse, entradaResponse] = await Promise.all([
          api.get("/Usuario/ExibirTodosUsuarios"),
          api.get("/Apartamento/ExibirTodosApartamentos"),
          api.get(`/AcessoEntradaMorador/FiltrarEntradasAdmin?dataFim=${hoje}`)
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">Nenhum alerta ativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <Link href="/usuarios/desktop">
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
            <Link href="/apartamentos">
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

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma atividade registrada ainda
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs ${
                        activity.status === "success"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {activity.type}
                    </div>
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
