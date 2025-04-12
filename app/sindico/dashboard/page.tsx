"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  Bell, 
  FileText, 
  MessageSquare, 
  Settings,
  Plus
} from "lucide-react"
import Link from "next/link"

export default function SindicoDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Painel do Síndico</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Button variant="outline" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Moradores</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">120</div>
              <p className="text-xs text-gray-500">+5 este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unidades Ocupadas</CardTitle>
              <Building2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-gray-500">102 de 120 unidades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avisos Ativos</CardTitle>
              <Bell className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-gray-500">3 novos hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocorrências</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500">2 pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <Link href="/sindico/moradores">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-6 w-6 text-[#26c9a8]" />
                  <div>
                    <h3 className="font-semibold">Gerenciar Moradores</h3>
                    <p className="text-sm text-gray-500">Adicionar, editar ou remover moradores</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <Link href="/sindico/avisos">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Bell className="h-6 w-6 text-[#26c9a8]" />
                  <div>
                    <h3 className="font-semibold">Avisos e Comunicados</h3>
                    <p className="text-sm text-gray-500">Criar e gerenciar avisos</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <Link href="/sindico/ocorrencias">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-[#26c9a8]" />
                  <div>
                    <h3 className="font-semibold">Ocorrências</h3>
                    <p className="text-sm text-gray-500">Registrar e acompanhar ocorrências</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Novo morador registrado</p>
                  <p className="text-sm text-gray-500">João Silva - Apartamento 101</p>
                </div>
                <span className="text-sm text-gray-500 ml-auto">2 horas atrás</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Novo aviso publicado</p>
                  <p className="text-sm text-gray-500">Manutenção do elevador</p>
                </div>
                <span className="text-sm text-gray-500 ml-auto">5 horas atrás</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Nova ocorrência registrada</p>
                  <p className="text-sm text-gray-500">Vazamento no 3º andar</p>
                </div>
                <span className="text-sm text-gray-500 ml-auto">1 dia atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 