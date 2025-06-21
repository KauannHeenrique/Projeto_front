"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
  
export default function ViewApartmentPage() {
  const router = useRouter();
  const { id } = useParams();

  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [situacao, setSituacao] = useState("1");
  const [observacoes, setObservacoes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
  const fetchApartamento = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/Apartamento/BuscarApartamentoPorId/${id}`);
      setBloco(data.bloco || "");
      setNumero(data.numero || "");
      setProprietario(data.proprietario || "");
      setSituacao(data.situacao?.toString() || "1");
      setObservacoes(data.observacoes || "");
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao conectar com a API.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (id) fetchApartamento();
}, [id]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
  <Button
    type="button"
    onClick={() => router.back()}
    variant="ghost"
    className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
  >
    <BsChevronDoubleLeft size={16} />
    Voltar
  </Button>
</div>


      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Detalhes do Apartamento</h1>

        {apiError && (
          <div className="mb-4 p-4 rounded bg-red-100 text-red-700">
            {apiError}
          </div>
        )}

        {!apiError && !isLoading && (
          <div className="space-y-4">
            <div className="flex flex-row gap-4">
              <div className="flex-1 bg-white border border-gray-300 rounded-2xl px-4 py-3">
                <p className="text-sm text-gray-500 mb-1">Bloco</p>
                <p className="text-base text-gray-800 font-medium">{bloco || "-"}</p>
              </div>
              <div className="flex-1 bg-white border border-gray-300 rounded-2xl px-4 py-3">
                <p className="text-sm text-gray-500 mb-1">Número</p>
                <p className="text-base text-gray-800 font-medium">{numero || "-"}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3">
              <p className="text-sm text-gray-500 mb-1">Proprietário</p>
              <p className="text-base text-gray-800 font-medium">{proprietario || "-"}</p>
            </div>

            <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3">
              <p className="text-sm text-gray-500 mb-1">Situação</p>
              <p className="text-base text-gray-800 font-medium">
                {situacao === "1" ? "Disponível" : situacao === "2" ? "Ocupado" : "Em manutenção"}
              </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3">
              <p className="text-sm text-gray-500 mb-1">Observações</p>
              <p className="text-base text-gray-800 font-medium whitespace-pre-wrap">{observacoes || "Nenhuma"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
