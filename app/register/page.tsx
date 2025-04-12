"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LockIcon, MailIcon, UserIcon } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle registration logic here
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }
    // TODO: Add registration API call
    window.location.href = "/login"
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

      {/* Right side - Registration Form */}
      <div className="flex w-full items-center justify-center bg-white md:w-1/2">
        <div className="w-full max-w-md px-8">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-4xl font-bold text-[#26c9a8]">Criar Conta</h1>
            <p className="text-center text-sm text-gray-700">Preencha seus dados para criar uma conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleChange}
                className="pl-10 h-12 rounded-full border-gray-200"
                required
              />
            </div>

            <div className="relative">
              <MailIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 h-12 rounded-full border-gray-200"
                required
              />
            </div>

            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="username"
                placeholder="Usuário"
                value={formData.username}
                onChange={handleChange}
                className="pl-10 h-12 rounded-full border-gray-200"
                required
              />
            </div>

            <div className="relative">
              <LockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                name="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 h-12 rounded-full border-gray-200"
                required
              />
            </div>

            <div className="relative">
              <LockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 h-12 rounded-full border-gray-200"
                required
              />
            </div>

            <Button type="submit" className="h-12 w-full rounded-full bg-[#26c9a8] text-white hover:bg-[#1eb598]">
              Registrar
            </Button>

            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-[#26c9a8] hover:text-[#1eb598]">
                Faça login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

