"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  age: number
  document: string
  email: string
  phone: string
  accessLevel: "morador" | "funcionario" | "sindico"
}

export default function EditUser({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState<User>({
    id: 0,
    name: "",
    age: 0,
    document: "",
    email: "",
    phone: "",
    accessLevel: "morador"
  })

  useEffect(() => {
    // Aqui você deve buscar os dados do usuário da API
    // Por enquanto, vamos usar dados de exemplo
    setFormData({
      id: Number(params.id),
      name: "Nome do Usuário",
      age: 30,
      document: "123.456.789-00",
      email: "usuario@email.com",
      phone: "(11) 99999-9999",
      accessLevel: "morador"
    })
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você pode adicionar a lógica para enviar os dados atualizados para a API
    console.log(formData)
    router.push("/usuarios")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar Usuário</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            name="name"
            placeholder="Nome completo"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <Input 
            name="age"
            type="number"
            placeholder="Idade"
            value={formData.age}
            onChange={handleChange}
            required
          />
          
          <Input 
            name="document"
            placeholder="Documento (CPF/RG)"
            value={formData.document}
            onChange={handleChange}
            required
          />
          
          <Input 
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <Input 
            name="phone"
            placeholder="Telefone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          
          <select 
            name="accessLevel"
            value={formData.accessLevel}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="morador">Morador</option>
            <option value="funcionario">Funcionário</option>
            <option value="sindico">Síndico</option>
          </select>
          
          <Button 
            type="submit" 
            className="w-full bg-yellow-500 hover:bg-yellow-600"
          >
            Salvar Alterações
          </Button>
        </form>
      </div>
    </div>
  )
} 