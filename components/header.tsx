"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FiFileText } from "react-icons/fi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Calendar,
  LogOut,
  Menu,
  Settings,
  X
} from "lucide-react"
import Cookies from "js-cookie"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await Cookies.remove('auth_token')
    router.push('/login')
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#26c9a8]">
            Condomínio JK
          </Link>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/report" className="text-sm font-medium text-gray-700 hover:text-[#26c9a8] flex items-center">
              <FiFileText className="h-4 w-4 mr-2" />
              Relatórios
            </Link>

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
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-md z-50 md:hidden">
            <div className="px-4 py-2 space-y-2">
              <Link
                href="/relatorios"
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-[#26c9a8]"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Relatórios
              </Link>
              <Link
                  href="/settings"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-[#26c9a8]"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        )}
    </header>
  )
}
