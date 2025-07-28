"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiFileText } from "react-icons/fi";
import api from "@/services/api";

interface Apartamento {
  id: number;
  bloco: string;
  numero: string;
  situacao: number;
}

export default function ApartmentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mostrarPopupRelatorio, setMostrarPopupRelatorio] = useState(false);
  

  useEffect(() => {
  const fetchApartamentos = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/Apartamento/ExibirTodosApartamentos");
      const mapped: Apartamento[] = data.map((a: any) => ({
        id: a.apartamentoId ?? a.id ?? a.idApartamento ?? 0,
        bloco: a.bloco || "Desconhecido",
        numero: String(a.numero || "Desconhecido"),
        situacao: a.situacao,
      }));
      setApartamentos(mapped);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao carregar apartamentos";
      setError(msg);
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

  <div className="flex gap-4">
    <Button
      type="button"
      onClick={() => setMostrarPopupRelatorio(true)}
      variant="ghost"
      className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
    >
      <FiFileText size={16} /> Gerar relatório
    </Button>

    <Button
      className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white text-sm py-2 px-3"
      onClick={() => router.push("/apartaments/desktop/adicionar")}
    >
      <span className="mr-2">+</span> Novo apartamento
    </Button>
  </div>
</div>
{mostrarPopupRelatorio && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      {/* Botão de fechar */}
      <button
        onClick={() => setMostrarPopupRelatorio(false)}
        className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        x
      </button>

      <h2 className="text-lg text-center font-semibold mb-2 text-[#217346]">
  Relatório gerado com sucesso
</h2>

<p className="text-sm text-center text-gray-700 mb-6">
  Clique no botão para fazer o download do arquivo.
</p>


<div className="flex justify-center">
  <Button
    className="bg-[#217346] hover:bg-[#1a5c38] text-white px-4 py-2 text-sm rounded"
    onClick={() => {
      const link = document.createElement("a");
      link.href = `${api.defaults.baseURL}/relatorios/apartamentos`;
      link.setAttribute("download", `Relatorio_Apartamentos.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMostrarPopupRelatorio(false);
    }}
  >
    Baixar Excel
  </Button>
      </div>
    </div>
  </div>
)}

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
                          router.push(`/apartaments/desktop/${apt.id}/editar`)
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
