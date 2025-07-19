"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

interface UsuarioRelatorio {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  nivelAcesso: string;
  status: boolean;
  apartamento: {
    bloco: string;
    numero: string;
  };
}


export default function VisualizarRelatorioUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioRelatorio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarRelatorio = async () => {
      try {
       // const { data } = await api.get("/relatorios/usuarios/visualizar"); // 👈 endpoint só para visualização
        setUsuarios(data);
      } catch (err) {
        console.error("Erro ao buscar relatório de usuários", err);
      } finally {
        setLoading(false);
      }
    };

    carregarRelatorio();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-[#217346] mb-4">
          Relatório de Usuários
        </h1>

        {loading ? (
          <p className="text-gray-500">Carregando relatório...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700 border">
              <thead className="bg-gray-100 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Telefone</th>
                  <th className="px-4 py-2">Documento</th>
                  <th className="px-4 py-2">Nível</th>
                  <th className="px-4 py-2">Bloco</th>
                  <th className="px-4 py-2">Apto</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2 text-left">{u.nome}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.telefone}</td>
                    <td className="px-4 py-2">{u.documento}</td>
                    <td className="px-4 py-2">{u.nivelAcesso}</td>
                    <td className="px-4 py-2">{u.apartamento?.bloco || "-"}</td>
                    <td className="px-4 py-2">{u.apartamento?.numero || "-"}</td>
                    <td className="px-4 py-2">
                      {u.status ? "Ativo" : "Inativo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
