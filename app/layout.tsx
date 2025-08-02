import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Controle de Acesso",
  description: "Sistema de controle de acesso para condomínios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
