"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus, Search, Trash2, Edit2 } from "lucide-react"

// Mock data - replace with actual API data
const mockNotices = [
  {
    id: 1,
    title: "Manutenção do Elevador",
    content: "Informamos que o elevador social passará por manutenção preventiva no próximo sábado, das 8h às 12h.",
    date: "2024-03-15",
    priority: "Alta"
  },
  {
    id: 2,
    title: "Reunião de Condomínio",
    content: "Convocamos todos os moradores para a reunião mensal do condomínio que ocorrerá no próximo dia 20/03 às 19h.",
    date: "2024-03-10",
    priority: "Média"
  },
  {
    id: 3,
    title: "Área de Lazer",
    content: "A área de lazer estará fechada para limpeza e manutenção nos dias 18 e 19/03.",
    date: "2024-03-08",
    priority: "Baixa"
  }
]

export default function AvisosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    priority: "Média"
  })

  const filteredNotices = mockNotices.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateNotice = () => {
    
    setIsCreating(false)
    setNewNotice({ title: "", content: "", priority: "Média" })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Avisos e Comunicados</h1>
          <Button 
            className="bg-[#26c9a8] hover:bg-[#1eb598]"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Aviso
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar avisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Criar Novo Aviso</CardTitle>
              <CardDescription>Preencha os detalhes do novo aviso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título do aviso"
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
              />
              <Textarea
                placeholder="Conteúdo do aviso"
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                className="min-h-[100px]"
              />
              <select
                value={newNotice.priority}
                onChange={(e) => setNewNotice({...newNotice, priority: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-[#26c9a8] hover:bg-[#1eb598]"
                onClick={handleCreateNotice}
              >
                Publicar
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="grid gap-6">
          {filteredNotices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{notice.title}</CardTitle>
                    <CardDescription>
                      Publicado em {new Date(notice.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{notice.content}</p>
                <div className="mt-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    notice.priority === "Alta" 
                      ? "bg-red-100 text-red-800" 
                      : notice.priority === "Média"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {notice.priority}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 