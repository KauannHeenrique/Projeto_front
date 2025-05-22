"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LockIcon, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/services/api"
import Cookies from "js-cookie"
import { validate } from "@/lib/validate_login"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
useEffect(() => {
  const runValidation = async () => {
    try {
      const result = await validate();  
      if (result) {
        router.push('/home');
      }
    } catch (error) {
      console.error('Erro na validação:', error);
    }
  };

  runValidation();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await api.post('/Usuario/Login', {
        cpf: username,
        senha: password
      })

      const token = response.data?.token || response.data?.accessToken
      if (!token) {
        throw new Error("Token de autenticação não encontrado.")
      }

      Cookies.set("auth_token", token, { expires: 1 })

      router.push("/home")
    } catch (error: any) {
      if (error.response) {
        const msg = error.response.data?.message || "Credenciais inválidas."
        setErrorMessage(msg)
      } else {
        setErrorMessage("Erro ao conectar com o servidor.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="relative hidden w-1/2 md:block">
        <Image
          src="/img/condominio-img.png"
          alt="Modern apartment buildings"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="flex w-full items-center justify-center bg-white md:w-1/2">
        <div className="w-full max-w-md px-8">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-4xl font-bold text-[#26c9a8]">Bem-vindo</h1>
            <p className="text-center text-sm text-gray-700">Entre com suas credenciais para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12 rounded-full border-gray-200"
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <LockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 rounded-full border-gray-200"
                required
                disabled={isLoading}
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm text-center">{errorMessage}</div>
            )}

            <div className="flex items-center justify-end">
              <Link href="/recuperar-senha" className="text-sm text-[#26c9a8] hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <Button 
              type="submit" 
              className="h-12 w-full rounded-full bg-[#26c9a8] text-white hover:bg-[#1eb598]"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
