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
import { Plus, Search, CheckCircle2, AlertCircle } from "lucide-react"

// Mock data - replace with actual API data
const mockOccurrences = [
  {
    id: 1,
    title: "Vazamento no 3º andar",
    description: "Vazamento de água no banheiro do apartamento 301",
    date: "2024-03-15",
    status: "Pendente",
    priority: "Alta",
    apartment: "301"
  },
  {
    id: 2,
    title: "Portão da garagem",
    description: "Portão da garagem não está fechando corretamente",
    date: "2024-03-14",
    status: "Em andamento",
    priority: "Média",
    apartment: "Comum"
  },
  {
    id: 3,
    title: "Lâmpada queimada",
    description: "Lâmpada do corredor do 5º andar queimada",
    date: "2024-03-13",
    status: "Resolvido",
    priority: "Baixa",
    apartment: "Comum"
  }
]

export default function OcorrenciasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newOccurrence, setNewOccurrence] = useState({
    title: "",
    description: "",
    priority: "Média",
    apartment: ""
  })

  const filteredOccurrences = mockOccurrences.filter(occurrence =>
    occurrence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    occurrence.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    occurrence.apartment.includes(searchTerm)
  )

  const handleCreateOccurrence = () => {
    // TODO: Implement API call to create occurrence
    setIsCreating(false)
    setNewOccurrence({ title: "", description: "", priority: "Média", apartment: "" })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ocorrências</h1>
          <Button 
            className="bg-[#26c9a8] hover:bg-[#1eb598]"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Ocorrência
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar ocorrências..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Registrar Nova Ocorrência</CardTitle>
              <CardDescription>Preencha os detalhes da ocorrência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título da ocorrência"
                value={newOccurrence.title}
                onChange={(e) => setNewOccurrence({...newOccurrence, title: e.target.value})}
              />
              <Textarea
                placeholder="Descrição detalhada"
                value={newOccurrence.description}
                onChange={(e) => setNewOccurrence({...newOccurrence, description: e.target.value})}
                className="min-h-[100px]"
              />
              <Input
                placeholder="Apartamento (ou 'Comum' para áreas comuns)"
                value={newOccurrence.apartment}
                onChange={(e) => setNewOccurrence({...newOccurrence, apartment: e.target.value})}
              />
              <select
                value={newOccurrence.priority}
                onChange={(e) => setNewOccurrence({...newOccurrence, priority: e.target.value})}
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
                onClick={handleCreateOccurrence}
              >
                Registrar
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="grid gap-6">
          {filteredOccurrences.map((occurrence) => (
            <Card key={occurrence.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{occurrence.title}</CardTitle>
                    <CardDescription>
                      Registrado em {new Date(occurrence.date).toLocaleDateString()} - 
                      Apartamento: {occurrence.apartment}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {occurrence.status === "Resolvido" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{occurrence.description}</p>
                <div className="flex space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    occurrence.priority === "Alta" 
                      ? "bg-red-100 text-red-800" 
                      : occurrence.priority === "Média"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {occurrence.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    occurrence.status === "Resolvido" 
                      ? "bg-green-100 text-green-800" 
                      : occurrence.status === "Em andamento"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {occurrence.status}
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