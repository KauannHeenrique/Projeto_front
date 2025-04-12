"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Calendar,
  Home,
  KeyRound,
  LogOut,
  Menu,
  Settings,
  X
} from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-[#26c9a8]">
                Controle de Acesso
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8 ml-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-[#26c9a8]"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link
                href="/acessos"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-[#26c9a8]"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Acessos
              </Link>
              <Link
                href="/relatorios"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-[#26c9a8]"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Relatórios
              </Link>
            </nav>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:text-[#26c9a8]"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/acessos"
              className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-[#26c9a8]"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Acessos
            </Link>
            <Link
              href="/relatorios"
              className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-[#26c9a8]"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Relatórios
            </Link>
          </div>
        </div>
      )}
    </header>
  )
} 