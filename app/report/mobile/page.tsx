"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiFileText } from "react-icons/fi";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/services/api";

interface ReportOption {
  id: string;
  title: string;
  description: string;
}

const reportOptions: ReportOption[] = [
  { id: "usuarios", title: "Relatório de Usuários", description: "Lista completa de usuários ativos e inativos." },
  { id: "visitantes", title: "Relatório de Visitantes", description: "Informações e histórico dos visitantes." },
  { id: "acessosVisitantes", title: "Acessos de Visitantes", description: "Entradas e saídas registradas para visitantes." },
  { id: "acessosMoradores", title: "Acessos de Moradores", description: "Entradas e saídas registradas para moradores." },
  { id: "notificacoes", title: "Relatório de Notificações", description: "Lista de notificações enviadas no sistema." },
  { id: "apartamentos", title: "Relatório de Apartamentos", description: "Informações detalhadas sobre apartamentos." },
];

export default function RelatoriosPage() {
  const router = useRouter();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [mostrarPopupRelatorio, setMostrarPopupRelatorio] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isSelected = (id: string) => selectedReports.includes(id);

  const gerarTextoBotao = () => {
    if (selectedReports.length === 1) return "Gerar Relatório";
    if (selectedReports.length > 1) return "Gerar Relatórios";
    return "Gerar Relatório";
  };

  // Mapear ID do front para rota do back
  const mapSingleReport = (id: string) => {
    switch (id) {
      case "usuarios": return "usuarios";
      case "visitantes": return "visitantes";
      case "apartamentos": return "apartamentos";
      case "acessosMoradores": return "entradas-morador";
      case "acessosVisitantes": return "entradas-visitante";
      case "notificacoes": return "notificacoes";
      default: return "";
    }
  };

  // Montar corpo do POST para múltiplos relatórios
  const buildMultipleReportRequest = (reports: string[]) => ({
    Usuarios: reports.includes("usuarios"),
    Visitantes: reports.includes("visitantes"),
    Apartamentos: reports.includes("apartamentos"),
    EntradasMorador: reports.includes("acessosMoradores"),
    EntradasVisitante: reports.includes("acessosVisitantes"),
    Notificacoes: reports.includes("notificacoes"),
  });

  // Função para baixar arquivo
  const downloadFile = (data: Blob, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Lógica para gerar relatório
  const gerarRelatorio = async () => {
    try {
      if (selectedReports.length === 1) {
        const report = selectedReports[0];
        const response = await axios.get(
          `${api.defaults.baseURL}/relatorios/${mapSingleReport(report)}`,
          { responseType: "blob" }
        );
        downloadFile(response.data, `Relatorio_${report}_${Date.now()}.xlsx`);
      } else {
        const body = buildMultipleReportRequest(selectedReports);
        const response = await axios.post(
          `${api.defaults.baseURL}/relatorios/multiplos`,
          body,
          { responseType: "blob" }
        );
        downloadFile(response.data, `Relatorios_${Date.now()}.xlsx`);
      }
      setMostrarPopupRelatorio(true);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <Button
            type="button"
            onClick={() => router.push("/home/desktop")}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
          >
            <BsChevronDoubleLeft size={16} /> Voltar
          </Button>

          <Button
            onClick={gerarRelatorio}
            disabled={selectedReports.length === 0}
            className={`px-4 py-2 text-sm rounded font-semibold ${
              selectedReports.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#26c9a8] hover:bg-[#1fa98a] text-white"
            }`}
          >
            {gerarTextoBotao()}
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Relatórios</h1>
        <p className="text-gray-700 mb-6">
          Selecione os relatórios que deseja gerar:
        </p>

        {/* Grid de boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => toggleSelection(option.id)}
              className={`cursor-pointer border rounded-lg p-6 shadow-sm hover:shadow-md transition 
                ${
                  isSelected(option.id)
                    ? "border-[#26c9a8] bg-[#f0fdfa]"
                    : "border-gray-300 bg-white"
                }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <FiFileText size={28} className="text-[#26c9a8]" />
                <h3 className="text-lg font-semibold">{option.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{option.description}</p>
              {isSelected(option.id) && (
                <div className="mt-3 text-[#26c9a8] font-medium text-sm">
                  ✓ Selecionado
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Popup */}
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
              {selectedReports.length === 1
                ? "Relatório gerado com sucesso"
                : "Relatórios gerados com sucesso"}
            </h2>

            <p className="text-sm text-center text-gray-700 mb-6">
              O download foi iniciado automaticamente.
            </p>

            <div className="flex justify-center">
              <Button
                className="bg-[#217346] hover:bg-[#1a5c38] text-white px-4 py-2 text-sm rounded"
                onClick={() => setMostrarPopupRelatorio(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
