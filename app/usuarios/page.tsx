"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  phone: string
  accessLevel: string
}

// Mock data - replace with actual API data
const mockUsers: User[] = []

export default function UsuariosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRemoveUser = async (userId: number) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      try {
        setUsers(users.filter(user => user.id !== userId))
      } catch (err) {
        setError('Falha ao remover usuário')
        console.error(err)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Usuários</h1>
          <div className="text-sm text-gray-600">
            Total de Usuários: {users.length}
          </div>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Buscar usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => router.push("/usuarios/adicionar")}
          >
            Adicionar Usuário
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 border-b last:border-b-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    className="bg-yellow-500 hover:bg-yellow-600"
                    onClick={() => router.push(`/usuarios/${user.id}/editar`)}
                  >
                    Editar
                  </Button>
                  <Button 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 