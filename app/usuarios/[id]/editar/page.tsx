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

export default function EditUser({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState<User>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    accessLevel: "morador"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // TODO: Implement API call to update user
      router.push("/usuarios")
    } catch (err) {
      setError('Falha ao atualizar usuário')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar Usuário</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            name="name"
            placeholder="Nome"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            disabled={isLoading}
          />
          
          <Input 
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            disabled={isLoading}
          />
          
          <Input 
            name="phone"
            placeholder="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
            disabled={isLoading}
          />
          
          <select 
            name="accessLevel"
            value={formData.accessLevel}
            onChange={(e) => setFormData({...formData, accessLevel: e.target.value})}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value="morador">Morador</option>
            <option value="funcionario">Funcionário</option>
            <option value="sindico">Síndico</option>
          </select>
          
          <Button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </div>
    </div>
  )
} 