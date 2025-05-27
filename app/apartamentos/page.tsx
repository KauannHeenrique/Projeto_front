"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Apartamento {
  id: number;
  bloco: string;
  numero: string;
}

export default function ApartamentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = "http://localhost:5263";

  useEffect(() => {
    const fetchApartamentos = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/Apartamento/ExibirTodosApartamentos`);
        if (!res.ok) throw new Error("Erro ao buscar apartamentos");

        const data = await res.json();
        const mapped: Apartamento[] = data.map((a: any) => ({
  id: a.apartamentoId ?? a.id ?? a.idApartamento ?? 0, // tenta várias opções
  bloco: a.bloco || "Desconhecido",
  numero: a.numero || "Desconhecido",
}));
        setApartamentos(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar apartamentos");
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApartamentos();
  }, []);

  const filtered = apartamentos.filter((a) => {
    const termo = searchTerm.toLowerCase();
    return (
      a.bloco.toLowerCase().includes(termo) ||
      a.numero.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold">Apartamentos</h1>
          <span className="text-sm text-gray-600">Total de apartamentos: {filtered.length}</span>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Buscar por bloco ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-between">
            <Button
              className="bg-gray-500 hover:bg-gray-600 text-sm py-2 px-3"
              onClick={() => router.back()}
            >
              Voltar
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 text-sm py-2 px-3"
              onClick={() => router.push("/apartamentos/adicionar")}
            >
              <span className="mr-2">+</span> Novo apartamento
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>
        )}

        {isLoading ? (
          <p>Carregando apartamentos...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-600">
            Nenhum apartamento encontrado.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm text-center text-gray-700">
                 <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3">Bloco</th>
                  <th scope="col" className="px-4 py-3">Apartamento</th>
                  <th scope="col" className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="px-4 py-3">{apt.bloco}</td>
                    <td className="px-4 py-3">{apt.numero}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/apartamentos/${apt.id}/detalhes`)}
                      >
                        Ver detalhes
                      </Button>
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
