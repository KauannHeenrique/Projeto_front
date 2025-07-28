"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FiUser, FiUsers, FiSave } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { formatCPF, formatCNPJ, cleanDocument } from "@/services/formatValues";

export default function AddManualEntry() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const registradoPor = user?.nome ?? "usuário_indefinido";

  const [tipo, setTipo] = useState<"morador" | "visitante" | "">("");
  const [cpf, setCpf] = useState("");
  const [morador, setMorador] = useState<any>(null);
  const [visitantes, setVisitantes] = useState<any[]>([]);
  const [visitanteSelecionado, setVisitanteSelecionado] = useState<any>(null);
  const [cnpj, setCnpj] = useState("");
  const [observacao, setObservacao] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [bloco, setBloco] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [cpfMorador, setCpfMorador] = useState("");

  // Buscar Morador
  const buscarMorador = async () => {
    const cpfLimpo = cleanDocument(cpf);
    try {
      const { data } = await api.get("/Usuario/BuscarUsuarioPor", {
        params: { documento: cpfLimpo },
      });

      if (Array.isArray(data) && data.length > 0) {
        setMorador(data[0]);
        setMensagem("");
      } else {
        setMorador(null);
        setMensagem(data.mensagem || "Morador não encontrado.");
      }
    } catch {
      setMensagem("Erro ao buscar morador.");
    }
  };

  // Buscar Visitante
  const buscarVisitante = async () => {
    const cpfLimpo = cleanDocument(cpf);
    const cnpjLimpo = cleanDocument(cnpj);

    if (!cpfLimpo && !cnpjLimpo) {
      setMensagem("Informe CPF ou CNPJ para buscar.");
      return;
    }

    try {
      const params: any = {};
      if (cpfLimpo) params.documento = cpfLimpo;
      if (cnpjLimpo) params.cnpj = cnpjLimpo;

      const { data } = await api.get("/Visitante/BuscarVisitantePor", { params });

      if (Array.isArray(data) && data.length > 0) {
        setVisitantes(data);
        setMensagem("");
      } else {
        setVisitantes([]);
        setMensagem("Nenhum visitante encontrado.");
      }
    } catch {
      setMensagem("Erro ao buscar visitante.");
    }
  };

  // Salvar Entrada Morador
  const salvarEntradaMorador = async () => {
    if (!morador || !user) return;

    const body = {
      usuarioId: morador.usuarioId,
      observacao,
      registradoPor,
    };

    try {
      await api.post("/AcessoEntradaMorador/RegistrarEntradaManual", body);
      setMensagem("Entrada registrada com sucesso!");
      setTimeout(() => router.push("/accessLog/desktop"), 2000);
    } catch (error: any) {
      const msg = error?.response?.data?.mensagem || "Erro ao registrar entrada.";
      setMensagem(msg);
    }
  };

  // Salvar Entrada Visitante com validação completa
  const salvarEntradaVisitante = async () => {
  if (!visitanteSelecionado || !user) {
    setMensagem("Selecione um visitante.");
    return;
  }

  if (!bloco || !apartamento || !cpfMorador) {
    setMensagem("Informe Bloco, Apartamento e CPF do Morador autorizador.");
    return;
  }

  try {
    setMensagem("Registrando entrada...");

    const body = {
      visitanteId: visitanteSelecionado.visitanteId,
      bloco,
      apartamento,
      cpfMorador,
      observacao,
      registradoPor,
    };

    await api.post("/AcessoEntradaVisitante/RegistrarEntradaVisitante", body);

    setMensagem("Entrada registrada com sucesso!");
    setTimeout(() => router.push("/accessLog/desktop"), 2000);
  } catch (error: any) {
    const msg = error?.response?.data?.mensagem || "Erro ao registrar entrada.";
    setMensagem(msg);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando dados do operador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
        <Button
          type="button"
          onClick={() => router.push("/accessLog/desktop")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={16} /> Voltar
        </Button>

        {tipo === "morador" && morador && (
          <Button
            onClick={salvarEntradaMorador}
            className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white flex items-center gap-2"
          >
            <FiSave size={16} /> Registrar
          </Button>
        )}

        {tipo === "visitante" && visitanteSelecionado && (
          <Button
            onClick={salvarEntradaVisitante}
            className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white flex items-center gap-2"
          >
            <FiSave size={16} /> Registrar
          </Button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-center mb-6"> Entrada manual</h1>

        {mensagem && (
  <div
    className={`text-sm mt-4 ${
      mensagem.toLowerCase().includes("sucesso") ? "text-green-600" : "text-red-600"
    }`}
  >
    {mensagem}
  </div>
)}


        {!tipo && (
          <div className="space-y-4">
            <p className="text-gray-700 font-medium text-lg text-center">
              Deseja registrar entrada de:
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setTipo("morador")}
                className="w-32 h-32 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2"
              >
                <FiUser size={32} className="text-[#26c9a8]" />
                <span className="font-semibold text-gray-700">Usuário</span>
              </button>
              <button
                onClick={() => setTipo("visitante")}
                className="w-32 h-32 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2"
              >
                <FiUsers size={32} className="text-[#26c9a8]" />
                <span className="font-semibold text-gray-700">Visitante</span>
              </button>
            </div>
          </div>
        )}

        {/* Fluxo MORADOR */}
        {tipo === "morador" && (
          <div className="space-y-6 mt-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Documento do Morador</label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                />
              </div>
              <Button onClick={buscarMorador}>Buscar</Button>
            </div>

            {morador && (
              <div className="bg-white border rounded p-4 space-y-2">
                {morador.fotoUrl && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={morador.fotoUrl}
                      alt={`Foto de ${morador.nome}`}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  </div>
                )}
                <p><strong>Nome:</strong> {morador.nome}</p>
                <p><strong>Bloco:</strong> {morador.apartamento?.bloco || "-"}</p>
                <p><strong>Apartamento:</strong> {morador.apartamento?.numero || "-"}</p>
                <p><strong>Registrado por:</strong> {registradoPor}</p>
              </div>
            )}

            {morador && (
              <div>
                <label className="block text-sm font-medium mb-1">Observação</label>
                <Input
                  placeholder="Ex: Entrou pela portaria lateral"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Fluxo VISITANTE */}
        {tipo === "visitante" && (
          <div className="space-y-6 mt-4">
            {!visitanteSelecionado && (
              <>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">CPF do Visitante</label>
                    <Input
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">CNPJ da Empresa</label>
                    <Input
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <Button onClick={buscarVisitante}>Buscar</Button>
                </div>

                {visitantes.length > 0 && (
                  <div className="bg-white border rounded p-4 space-y-3">
                    <h3 className="font-semibold mb-2">Resultados:</h3>
                    {visitantes.map((v) => (
                      <div
                        key={v.visitanteId}
                        className="bg-white rounded-lg shadow-sm p-4 mb-4 border hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-lg font-semibold text-gray-800">{v.nome}</p>
                            <p className="text-sm text-gray-600">
                              Documento: {formatCPF(v.documento) || "-"}
                            </p>
                            {v.cnpj && (
                              <>
                                <p className="text-sm text-gray-600">
                                  Empresa: {v.nomeEmpresa || "-"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  CNPJ: {formatCNPJ(v.cnpj)}
                                </p>
                              </>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setVisitanteSelecionado(v)}
                          >
                            Selecionar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {visitanteSelecionado && (
              <>
                <div className="bg-white border rounded p-4 space-y-2">
                  <p><strong>Nome:</strong> {visitanteSelecionado.nome}</p>
                  <p><strong>Documento:</strong> {formatCPF(visitanteSelecionado.documento)}</p>
                  {visitanteSelecionado.cnpj && (
                    <>
                      <p><strong>Empresa:</strong> {visitanteSelecionado.nomeEmpresa || "-"}</p>
                      <p><strong>CNPJ:</strong> {formatCNPJ(visitanteSelecionado.cnpj)}</p>
                    </>
                  )}
                  <p><strong>Registrado por:</strong> {registradoPor}</p>
                </div>

                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Bloco</label>
                    <Input
                      placeholder="Ex: A"
                      value={bloco}
                      onChange={(e) => setBloco(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Apartamento</label>
                    <Input
                      placeholder="Ex: 101"
                      value={apartamento}
                      onChange={(e) => setApartamento(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">CPF do Morador Autorizador</label>
                  <Input
                    placeholder="000.000.000-00"
                    value={cpfMorador}
                    onChange={(e) => setCpfMorador(formatCPF(e.target.value))}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Observação</label>
                  <Input
                    placeholder="Ex: Visitante para manutenção"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
