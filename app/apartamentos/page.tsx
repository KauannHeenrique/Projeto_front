"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";

interface Apartamento {
  id: number;
  bloco: string;
  numero: string;
  situacao: number;
}

export default function ApartamentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = "http://172.20.10.2:5263";

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
          numero: String(a.numero || "Desconhecido"),
          situacao: a.situacao, // Aqui, a situação deve ser numérica
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
  const termo = searchTerm.trim().toLowerCase();

  return (
    String(a.bloco).toLowerCase().includes(termo) ||
    String(a.numero).toLowerCase() === termo
  );
});


  const getSituacaoLabel = (situacao: number) => {
    switch (situacao) {
      case 1:
        return "Disponível";
      case 2:
        return "Ocupado";
      case 3:
        return "Em Manutenção";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b px-4 sm:px-6 md:px-8 py-2 flex justify-between items-center shadow-sm">
        <Button
          type="button"
          onClick={() => router.push("/home")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={16} />
          Voltar
        </Button>

        <Button
          className="bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3"
          onClick={() => router.push("/apartamentos/adicionar")}
        >
          <span className="mr-2">+</span> Novo apartamento
        </Button>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-[70rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-4 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold">Apartamentos</h1>
          <span className="text-sm text-gray-600">
            Total de apartamentos: {filtered.length}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>
        )}

        <div className="mb-6">
          <Input
            placeholder="Buscar por bloco ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
        </div>

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
                  <th scope="col" className="px-4 py-3">Situação</th> 
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
                    <td className="px-4 py-3">{getSituacaoLabel(apt.situacao)}</td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/apartamentos/${apt.id}/editar`)
                        }
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
