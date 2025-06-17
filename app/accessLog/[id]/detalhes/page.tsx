"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BsChevronDoubleLeft } from "react-icons/bs";
import api from "@/services/api";
import { formatCPF, formatCNPJ } from "@/services/formatValues";

interface AcessoDetalhado {
  nome: string;
  documento: string;
  bloco: string;
  apartamento: string;
  nivelAcesso: string;
  fotoUrl?: string;
  dataHoraEntrada: string;
  entradaPor: string;
  codigoRFID?: string;
  observacao?: string;
  registradoPor?: string;
}

export default function DetalhesAcessoPage() {
  const router = useRouter();
  const { id } = useParams();
  const [detalhes, setDetalhes] = useState<AcessoDetalhado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcesso = async () => {
       try {
      const { data } = await api.get("/AcessoEntradaMorador/BuscarEntradaPorId", {
        params: { id },
      });

      if (!data || !data.usuario) {
        setErro("Acesso não encontrado.");
        return;
      }

        setDetalhes({
          nome: data.usuario.nome,
          documento: data.usuario.documento,
          bloco: data.usuario.apartamento?.bloco || "-",
          apartamento: data.usuario.apartamento?.numero || "-",
          nivelAcesso: data.usuario.nivelAcesso,
          fotoUrl: data.usuario.fotoUrl,
          dataHoraEntrada: data.dataHoraEntrada,
          entradaPor: data.entradaPor,
          codigoRFID: data.codigoRFID,
          observacao: data.observacao,
          registradoPor: data.registradoPor
        });
      } catch (err) {
        setErro("Erro ao carregar detalhes do acesso.");
      }
    };

    if (id) fetchAcesso();
  }, [id]);

  const formatarData = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString();
  };

  const formatarHora = (iso: string) => {
    const date = new Date(iso);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
        <Button
          type="button"
          onClick={() => router.push("/accessLog")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={16} /> Voltar
        </Button>
        
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">Detalhes do Acesso</h1>

        {erro && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{erro}</div>}

        {detalhes && (
  <div className="bg-white shadow rounded p-6 space-y-6">
    {/* Cabeçalho com Foto */}
    <div className="flex items-center gap-6 mb-4">
      <div className="w-24 h-24 flex-shrink-0 border rounded-full bg-gray-100 overflow-hidden">
        {detalhes.fotoUrl ? (
          <img
            src={detalhes.fotoUrl}
            alt={`Foto de ${detalhes.nome}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Sem foto
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold">{detalhes.nome}</h2>
        <p className="text-gray-500 text-sm">
  Documento: {
    detalhes.documento.replace(/\D/g, "").length === 11
      ? formatCPF(detalhes.documento)
      : formatCNPJ(detalhes.documento)
  }
</p>

      </div>
    </div>

    {/* Grade em 3 colunas com 3 linhas visuais */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Coluna 1 */}
      <div className="space-y-2">
        <div>
          <strong>Nível de Acesso:</strong><br />
          {detalhes.nivelAcesso}
        </div>
        <div>
          <strong>Bloco:</strong><br />
          {detalhes.bloco}
        </div>
        <div>
          <strong>Data:</strong><br />
          {formatarData(detalhes.dataHoraEntrada)}
        </div>
      </div>

      {/* Coluna 2 */}
      <div className="space-y-2">
        <div>
          <strong>Tipo de Entrada:</strong><br />
          {detalhes.entradaPor === "1" ? "TAG" : "Manual"}
        </div>
        <div>
          <strong>Apartamento:</strong><br />
          {detalhes.apartamento}
        </div>
        <div>
          <strong>Hora:</strong><br />
          {formatarHora(detalhes.dataHoraEntrada)}
        </div>
      </div>

      {/* Coluna 3 */}
      <div className="space-y-2">
        {detalhes.entradaPor === "1" && detalhes.codigoRFID && (
  <div>
    <strong>Código RFID:</strong><br />
    {detalhes.codigoRFID}
  </div>
)}
      </div>
    </div>

    {/* Campos extras - só para entrada manual */}
    {detalhes.entradaPor === "2" && (
      <div className="pt-6 space-y-2 border-t border-gray-200">
        {detalhes.registradoPor && (
          <div>
            <strong>Registrado por:</strong><br />
            {detalhes.registradoPor}
          </div>
        )}
        {detalhes.observacao && (
          <div>
            <strong>Observação:</strong><br />
            {detalhes.observacao}
          </div>
        )}
      </div>
    )}
  </div>
)}


      </div>
    </div>
  );
}
