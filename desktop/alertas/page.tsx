"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Trash } from "lucide-react"

interface Alert {
  id: number
  title: string
  message: string
  date: string
  read: boolean
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Marcar notificação como lida
  const markAsRead = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ))
  }

  // Remover notificação
  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Alertas e Notificações</h1>

        {/* Lista de alertas */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-4 bg-white rounded-lg shadow ${
                !alert.read ? "border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!alert.read && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => markAsRead(alert.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeAlert(alert.id)}
                  >
                    <Trash className="h-4 w-4" />
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