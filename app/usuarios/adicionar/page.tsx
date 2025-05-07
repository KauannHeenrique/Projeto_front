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
  document: string
  accessLevel: string
  apartment: string
  block: string
  apartmentNumber: string
}

export default function AddUser() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    accessLevel: "morador",
    apartment: "",
    block: "",
    apartmentNumber: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // TODO: Implement API call to create user
      router.push("/usuarios")
    } catch (err) {
      setError('Falha ao criar usuário')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Adicionar Usuário</h1>
        
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

          <Input 
            name="document"
            placeholder="Documento (CPF/RG)"
            value={formData.document}
            onChange={(e) => setFormData({...formData, document: e.target.value})}
            required
            disabled={isLoading}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input 
              name="block"
              placeholder="Bloco"
              value={formData.block}
              onChange={(e) => setFormData({...formData, block: e.target.value})}
              required
              disabled={isLoading}
            />
            
            <Input 
              name="apartment"
              placeholder="Apartamento"
              value={formData.apartment}
              onChange={(e) => setFormData({...formData, apartment: e.target.value})}
              required
              disabled={isLoading}
            />
            
            <Input 
              name="apartmentNumber"
              placeholder="Número"
              value={formData.apartmentNumber}
              onChange={(e) => setFormData({...formData, apartmentNumber: e.target.value})}
              required
              disabled={isLoading}
            />
          </div>
          
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