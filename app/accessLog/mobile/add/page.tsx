"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FiUser, FiUsers, FiSave } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import {
  formatCPF,
  formatCNPJ,
  formatPhone,
  cleanDocument,
} from "@/services/formatValues";

export default function AddManualEntry() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const registradoPor = user?.nome ?? "usuário_indefinido";

  const [tipo, setTipo] = useState<"morador" | "visitante" | "">("");
  const [documento, setDocumento] = useState("");
  const [morador, setMorador] = useState<any>(null);
  const [visitante, setVisitante] = useState<any>(null);
  const [listaVisitantes, setListaVisitantes] = useState<any[]>([]);
  const [observacao, setObservacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  const [bloco, setBloco] = useState("");
const [apartamento, setApartamento] = useState("");
const [cpfMorador, setCpfMorador] = useState("");

  // Função para formatar documento dinamicamente
  const handleDocumentoChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      setDocumento(formatCPF(digits));
    } else {
      setDocumento(formatCNPJ(digits));
    }
  };

  const handleTipoChange = (novoTipo: "morador" | "visitante") => {
    setTipo(novoTipo);
    setDocumento("");
    setMensagem("");
    setObservacao("");
    setMorador(null);
    setVisitante(null);
    setListaVisitantes([]);
  };

  const buscarMorador = async () => {
    const docLimpo = cleanDocument(documento);

    try {
      const { data } = await api.get("/Usuario/BuscarUsuarioPor", {
        params: { documento: docLimpo },
      });

      if (Array.isArray(data) && data.length > 0) {
        setMorador(data[0]);
        setMensagem("");
      } else {
        setMorador(null);
        setMensagem("Morador não encontrado.");
      }
    } catch {
      setMensagem("Erro ao buscar morador.");
    }
  };

  const buscarVisitante = async () => {
    const docLimpo = cleanDocument(documento);

    try {
      const { data } = await api.get("/Visitante/BuscarVisitantePor", {
        params: { documento: docLimpo },
      });

      if (Array.isArray(data) && data.length > 0) {
        if (data.length === 1) {
          // Apenas um visitante
          setVisitante(data[0]);
          setListaVisitantes([]);
        } else {
          // Vários visitantes (CNPJ)
          setListaVisitantes(data);
          setVisitante(null);
        }
        setMensagem("");
      } else {
        setVisitante(null);
        setListaVisitantes([]);
        setMensagem("Nenhum visitante encontrado.");
      }
    } catch {
      setMensagem("Erro ao buscar visitante.");
    }
  };

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
      setTimeout(() => router.push("/accessLog"), 2000);
    } catch (error: any) {
      const msg =
        error?.response?.data?.mensagem || "Erro ao registrar entrada.";
      setMensagem(msg);
    }
  };

  const salvarEntradaVisitante = async () => {
    if (!visitante || !user) return;

    const body = {
    visitanteId: visitante.visitanteId,
    bloco,
    apartamento,
    cpfMorador: cleanDocument(cpfMorador), // Remove máscara antes de enviar
    observacao,
    registradoPor,
  };

  console.log("✅ Dados enviados para API:", body); // <-- DEBUG

    try {
      await api.post("/AcessoEntradaVisitante/RegistrarEntradaVisitante", body);
      setMensagem("Entrada registrada com sucesso!");
      setTimeout(() => router.push("/accessLog"), 2000);
    } catch (error: any) {
      const msg =
        error?.response?.data?.mensagem || "Erro ao registrar entrada.";
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
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
        <Button
          type="button"
          onClick={() => router.push("/accessLog")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={16} />
          Voltar
        </Button>

        <div className="flex items-center gap-2">
          {tipo && (
            <Button
              type="button"
              onClick={() => {
                setTipo("");
                setDocumento("");
                setMensagem("");
                setObservacao("");
                setMorador(null);
                setVisitante(null);
                setListaVisitantes([]);
              }}
              variant="outline"
              className="text-sm"
            >
              Alterar tipo de cadastro
            </Button>
          )}

          
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-center mb-6">
          Registrar Entrada Manual
        </h1>

        {!tipo && (
          <div className="space-y-4">
            <p className="text-gray-700 font-medium text-lg text-center">
              Deseja registrar entrada de:
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => handleTipoChange("morador")}
                className="w-32 h-32 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-[#26c9a8] hover:shadow-md transition-all flex flex-col items-center justify-center gap-2"
              >
                <FiUser size={32} className="text-[#26c9a8]" />
                <span className="font-semibold text-gray-700">Morador</span>
              </button>
              <button
                onClick={() => handleTipoChange("visitante")}
                className="w-32 h-32 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-[#26c9a8] hover:shadow-md transition-all flex flex-col items-center justify-center gap-2"
              >
                <FiUsers size={32} className="text-[#26c9a8]" />
                <span className="font-semibold text-gray-700">Visitante</span>
              </button>
            </div>
          </div>
        )}

        {/* FORMULÁRIO MORADOR */}
        {tipo === "morador" && (
          <div className="space-y-6 mt-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Documento do Morador
                </label>
                <Input
                  value={documento}
                  onChange={(e) => handleDocumentoChange(e.target.value)}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="tel"
                />
              </div>
              <Button
                onClick={buscarMorador}
                className="bg-[#26c9a8] hover:bg-[#1fa78d] text-white"
              >
                Buscar
              </Button>
            </div>

            {mensagem && (
  <div
    className={`text-sm font-medium ${
      mensagem.toLowerCase().includes("sucesso")
        ? "text-green-600"
        : "text-red-600"
    }`}
  >
    {mensagem}
  </div>
)}


            {morador && (
              <div className="bg-white border rounded p-4 space-y-4 shadow-sm">
                {morador.fotoUrl && (
                  <div
                    className="flex left mb-4 cursor-pointer"
                    onClick={() => setShowPhotoModal(true)}
                  >
                    <img
                      src={morador.fotoUrl}
                      alt={`Foto de ${morador.nome}`}
                      className="w-28 h-28 rounded-full object-cover border shadow"
                    />
                  </div>
                )}
                <p>
                  <strong>Nome:</strong> {morador.nome}
                </p>
                <p>
                  <strong>Bloco:</strong> {morador.apartamento?.bloco || "-"}
                </p>
                <p>
                  <strong>Apartamento:</strong>{" "}
                  {morador.apartamento?.numero || "-"}
                </p>
                <p>
                  <strong>Nível de Acesso:</strong>{" "}
                  {morador.nivelAcesso || "-"}
                </p>
                <p>
                  <strong>Registrado por:</strong> {registradoPor}
                </p>
              </div>
            )}

            {morador && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Observação
                </label>
                <Input
                  placeholder="Ex: Entrou pela portaria lateral"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>
            )}

            {tipo === "morador" && morador && (
            <Button
              onClick={salvarEntradaMorador}
              className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white flex items-center gap-2"
            >
              <FiSave size={16} />
              Registrar
            </Button>
          )}
          </div>
        )}

        {/* FORMULÁRIO VISITANTE */}
        {tipo === "visitante" && (
          <div className="space-y-6 mt-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Documento do Visitante
                </label>
                <Input
                  value={documento}
                  onChange={(e) => handleDocumentoChange(e.target.value)}
                  placeholder="CPF ou CNPJ"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="tel"
                />
              </div>
              <Button
                onClick={buscarVisitante}
                className="bg-[#26c9a8] hover:bg-[#1fa78d] text-white"
              >
                Buscar
              </Button>
            </div>

            {mensagem && (
  <div
    className={`text-sm font-medium ${
      mensagem.toLowerCase().includes("sucesso")
        ? "text-green-600"
        : "text-red-600"
    }`}
  >
    {mensagem}
  </div>
)}

            {/* Lista de visitantes (CNPJ) */}
            {listaVisitantes.length > 0 && (
              <div className="mt-4">
  {!visitante ? (
    <>
      <p className="font-semibold text-gray-700 mb-4">
        Selecione o visitante da empresa:
      </p>
      <div className="space-y-3">
        {listaVisitantes.map((v) => (
          <label
            key={v.visitanteId}
            className="flex items-start gap-3 bg-white border rounded-lg p-3 cursor-pointer hover:border-[#26c9a8] hover:shadow-md transition-all"
          >
            <input
              type="radio"
              name="visitanteSelecionado"
              value={v.visitanteId}
              onChange={() => setVisitante(v)}
              className="mt-1 w-4 h-4"
            />
            <div>
              <p className="font-medium">{v.nome}</p>
              <p className="text-sm text-gray-600">
                Documento:{" "}
                {v.documento.replace(/\D/g, "").length > 11
                  ? formatCNPJ(v.documento)
                  : formatCPF(v.documento)}
              </p>
              <p className="text-sm text-gray-600">
                Telefone: {formatPhone(v.telefone)}
              </p>
            </div>
          </label>
        ))}
      </div>
    </>
  ) : (
    <div className="bg-white border rounded-lg p-4 shadow-md flex justify-between items-center">
      <div>
        <p className="font-medium">{visitante.nome}</p>
        <p className="text-sm text-gray-600">
          Documento:{" "}
          {visitante.documento.replace(/\D/g, "").length > 11
            ? formatCNPJ(visitante.documento)
            : formatCPF(visitante.documento)}
        </p>
        <p className="text-sm text-gray-600">
          Telefone: {formatPhone(visitante.telefone)}
        </p>
      </div>
      <button
        onClick={() => setVisitante(null)}
        className="text-red-500 font-bold text-xl ml-4 hover:text-red-700"
      >
        ×
      </button>
    </div>
  )}
</div>

            )}

            {/* Visitante selecionado */}
            {visitante && (
  <>
    <div className="bg-white border rounded p-4 space-y-4 shadow-sm mt-4">
      <p>
        <strong>Nome:</strong> {visitante.nome}
      </p>
      <p>
        <strong>Documento:</strong>{" "}
        {visitante.documento.replace(/\D/g, "").length > 11
          ? formatCNPJ(visitante.documento)
          : formatCPF(visitante.documento)}
      </p>
      <p>
        <strong>Telefone:</strong> {formatPhone(visitante.telefone)}
      </p>
      {visitante.nomeEmpresa && (
        <p>
          <strong>Empresa:</strong> {visitante.nomeEmpresa}
        </p>
      )}
    </div>

    {/* ✅ CAMPOS ADICIONADOS AQUI */}
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Bloco</label>
        <Input
          placeholder="Ex: A"
          value={bloco}
          onChange={(e) => setBloco(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Apartamento
        </label>
        <Input
          placeholder="Ex: 101"
          inputMode="numeric"
          type="number"
          value={apartamento}
          onChange={(e) => setApartamento(e.target.value)}
        />
      </div>
    </div>

    <div className="mt-4">
      <label className="block text-sm font-medium mb-1">
        CPF do Morador (que autorizou)
      </label>
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
    {/* ✅ FIM DOS CAMPOS */}

    <Button
      onClick={salvarEntradaVisitante}
      className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white flex items-center gap-2 mt-4"
    >
      <FiSave size={16} />
      Registrar
    </Button>
  </>
)}

          </div>
        )}
      </div>

      {/* Modal de Foto */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPhotoModal(false)}
        >
          <img
            src={morador?.fotoUrl}
            alt="Foto ampliada"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
          <button
            className="absolute top-4 right-6 text-white text-3xl font-bold"
            onClick={() => setShowPhotoModal(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
