"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";
import api from "@/services/api";
import { formatCPF, formatPhone, formatCNPJ, cleanDocument } from "@/services/formatValues";

export default function AddVisitor() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [isPrestador, setIsPrestador] = useState(false);
  const [empresa, setEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function formatCpfOrCnpj(value: string) {
  const onlyDigits = value.replace(/\D/g, "").slice(0, 14); 

  if (onlyDigits.length <= 11) {
    return formatCPF(onlyDigits);
  } else {
    return formatCNPJ(onlyDigits);
  }
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem("");

    if (!nome.trim() || !documento.trim() || !telefone.trim()) {
      setMensagem("Preencha todos os campos obrigatórios.");
      setIsLoading(false);
      return;
    }

    if (isPrestador && (!empresa.trim() || !cnpj.trim())) {
      setMensagem("Preencha o nome da empresa e o CNPJ.");
      setIsLoading(false);
      return;
    }

    try {
      const body: any = {
        Nome: nome,
        Documento: cleanDocument(documento),
        Telefone: cleanDocument(telefone),
        PrestadorServico: isPrestador,
      };

      if (isPrestador) {
        body.NomeEmpresa = empresa;
        body.CNPJ = cleanDocument(cnpj);
      }

      await api.post("Visitante/CadastrarVisitante", body);
      setMensagem("Visitante cadastrado com sucesso!");
      setTimeout(() => router.push("/users"), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao cadastrar visitante.";
      setMensagem(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
        <Button
          type="button"
          onClick={() => router.push("/users")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={16} />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => router.push("/users/mobile/adicionar")}
            variant="outline"
            className="text-sm"
          >
            Alterar tipo de cadastro
          </Button>
          <Button
            type="submit"
            form="visitorForm"
            disabled={isLoading}
            className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-2 text-sm"
          >
            <FiSave size={16} />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-center mb-10">Cadastrar Visitante</h1>

        {mensagem && (
          <div className={`mb-6 p-4 rounded ${mensagem.includes("sucesso") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} id="visitorForm" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">Nome</label>
<Input
  placeholder="Nome completo"
  value={nome}
  onChange={(e) => setNome(e.target.value)}
  disabled={isLoading}
/>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">Documento (CPF/RG)</label>
<Input
  placeholder="000.000.000-00"
  value={documento}
  onChange={(e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ""); // Remove não numéricos
    setDocumento(formatCPF(onlyNumbers));
  }}
  disabled={isLoading}
  inputMode="numeric" // Teclado numérico no mobile
  pattern="[0-9]*"    // Aceita apenas números
/>

            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-6 sm:items-end">
  {/* Campo telefone com largura igual a Nome */}
  <div className="w-full sm:w-1/2">
    <label className="block text-sm font-medium mb-1">Telefone</label>
    <Input
  placeholder="(99) 99999-9999"
  value={telefone}
  onChange={(e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
    setTelefone(formatPhone(onlyNumbers));
  }}
  disabled={isLoading}
  inputMode="numeric" // Mostra teclado numérico no mobile
  pattern="[0-9]*"    // Aceita apenas números
/>


  </div>

  {/* Checkbox alinhado à direita */}
 <div className="h-10 flex justify-center items-center">
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="prestador"
      checked={isPrestador}
      onChange={(e) => setIsPrestador(e.target.checked)}
      disabled={isLoading}
      className="w-4 h-4"
    />
    <label htmlFor="prestador" className="text-sm font-medium text-gray-700 whitespace-nowrap">
      É prestador de serviço?
    </label>
  </div>
</div>

</div>


          {isPrestador && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da empresa</label>
<Input
  placeholder="Nome da empresa prestadora"
  value={empresa}
  onChange={(e) => setEmpresa(e.target.value)}
  disabled={isLoading}
/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
<Input
  placeholder="00.000.000/0000-00"
  value={cnpj}
  onChange={(e) => setCnpj(formatCpfOrCnpj(e.target.value))}
  disabled={isLoading}
/>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
