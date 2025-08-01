"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FiUsers, FiUser, FiSearch, FiSave } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { formatCPF, formatPhone, cleanDocument } from "@/services/formatValues";
import api from "@/services/api";
import rfid from "@/services/rfid_url";

interface FormData {
  name: string;
  email: string;
  phone: string;
  document: string;
  accessLevel: string;
  apartmentId: string;
  codigoRFID: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  apartmentId?: string;
  accessLevel?: string;
  codigoRFID?: string;
}

export default function AddUser() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    document: "",
    accessLevel: "",
    apartmentId: "",
    codigoRFID: "",
  });
  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [tipoCadastro, setTipoCadastro] = useState<
    "morador" | "visitante" | ""
  >("");

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tipoCadastro === "visitante") {
      router.push("/visitors/add");
    }
  }, [tipoCadastro, router]);

  // Fechar popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverOpen]);

  // Limpar apartmentId e erros quando accessLevel mudar para funcionario
  useEffect(() => {
    if (formData.accessLevel === "funcionario") {
      setFormData((prev) => ({ ...prev, apartmentId: "" }));
      setBloco("");
      setNumero("");
      setErrors((prev) => ({ ...prev, apartmentId: undefined }));
    }
  }, [formData.accessLevel]);

  const isValidCPF = (cpf: string): boolean => {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let firstDigit = (sum * 10) % 11;
    if (firstDigit === 10) firstDigit = 0;
    if (firstDigit !== parseInt(digits[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    let secondDigit = (sum * 10) % 11;
    if (secondDigit === 10) secondDigit = 0;
    return secondDigit === parseInt(digits[10]);
  };

  const buscarApartamento = async () => {
    const blocoLimpo = bloco.trim().toUpperCase();
    const numeroLimpo = numero.trim();

    if (!blocoLimpo || !numeroLimpo) {
      setApiError("Informe o bloco e número do apartamento.");
      return;
    }

    try {
      const { data } = await api.get("/Apartamento/BuscarApartamentoPor", {
        params: { bloco: blocoLimpo, numero: numeroLimpo },
      });

      console.log("Dados recebidos da API (apartamento):", data);

      if (Array.isArray(data) && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          apartmentId: data[0].id.toString(),
        }));
        setApiError("Apartamento encontrado com sucesso!");
      } else {
        setFormData((prev) => ({ ...prev, apartmentId: "" }));
        setApiError("Apartamento não encontrado.");
      }
    } catch (err) {
      console.error("Erro ao buscar apartamento:", err);
      setApiError("Erro ao buscar apartamento.");
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "O nome é obrigatório.";
    else if (formData.name.length < 2)
      newErrors.name = "O nome deve ter pelo menos 2 caracteres.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "O email é obrigatório.";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email inválido.";

    const phoneDigits = formData.phone.replace(/\D/g, "");
    const phoneRegex = /^\d{2}9\d{8}$/;
    if (!phoneDigits) newErrors.phone = "O telefone é obrigatório.";
    else if (!phoneRegex.test(phoneDigits))
      newErrors.phone = "Telefone inválido.";

    const documentDigits = formData.document.replace(/\D/g, "");
    const rgRegex = /^[a-zA-Z0-9]{1,12}$/;
    if (!formData.document.trim())
      newErrors.document = "O documento é obrigatório.";
    else if (documentDigits.length === 11 && !isValidCPF(formData.document)) {
      newErrors.document = "CPF inválido.";
    } else if (documentDigits.length !== 11 && !rgRegex.test(documentDigits)) {
      newErrors.document = "RG inválido.";
    }

    const validAccessLevels = ["funcionario", "sindico", "morador"];
    if (!validAccessLevels.includes(formData.accessLevel))
      newErrors.accessLevel = "Selecione um nível válido.";

    if (formData.accessLevel !== "funcionario") {
      const apartmentIdNum = parseInt(formData.apartmentId);
      if (!formData.apartmentId.trim())
        newErrors.apartmentId = "O apartamento é obrigatório.";
      else if (isNaN(apartmentIdNum) || apartmentIdNum <= 0)
        newErrors.apartmentId = "ID inválido.";
    }

    if (formData.codigoRFID && !/^[a-zA-Z0-9]{8}$/.test(formData.codigoRFID))
      newErrors.codigoRFID =
        "O código RFID deve ter 8 caracteres alfanuméricos.";

    return newErrors;
  };

  const handleReadRFID = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setApiError(null);
    setErrors((prev) => ({ ...prev, codigoRFID: undefined }));

    try {
      const { data } = await rfid.get("/read-rfid");

      console.log("Dados recebidos da API (RFID):", data);

      if (data.uid) {
        setFormData((prev) => ({ ...prev, codigoRFID: data.uid }));
        setApiError("Tag lida com sucesso!");
      } else {
        setFormData((prev) => ({ ...prev, codigoRFID: "" }));
        setApiError("Nenhuma tag detectada.");
      }
    } catch (err) {
      console.error("Erro ao ler RFID:", err);
      setApiError("Erro ao comunicar com o leitor RFID.");
      setFormData((prev) => ({ ...prev, codigoRFID: "" }));
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setApiError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      console.log("Erros de validação:", validationErrors);
      return;
    }

    try {
      const nivelAcessoMap: { [key: string]: number } = {
        sindico: 2,
        funcionario: 3,
        morador: 4,
      };

      const usuario = {
        Nome: formData.name,
        Email: formData.email,
        Telefone: cleanDocument(formData.phone),
        Documento: cleanDocument(formData.document),
        NivelAcesso: nivelAcessoMap[formData.accessLevel],
        ApartamentoId:
          formData.accessLevel === "funcionario"
            ? null
            : parseInt(formData.apartmentId) || null,
        CodigoRFID: formData.codigoRFID || null,
        Senha: "default123",
        Status: true,
      };

      console.log("Enviando dados para a API:", usuario);

      const { data } = await api.post("/Usuario/AdicionarUsuario", usuario);
      console.log("Resposta da API (cadastro):", data);

      setApiError("Morador cadastrado com sucesso!");
      setTimeout(() => router.push("/users"), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao cadastrar morador.";
      setApiError(msg);
      console.error("Erro ao cadastrar morador:", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!tipoCadastro && (
        <div className="min-h-screen bg-gray-50">
          {/* Barra Superior com botão Voltar */}
          <div className="sticky top-0 z-20 bg-white border-b px-4 py-2 flex items-center shadow-sm">
            <Button
              type="button"
              onClick={() => router.push("/users")}
              variant="ghost"
              className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
            >
              <BsChevronDoubleLeft size={16} />
              Voltar
            </Button>
          </div>

          {/* Conteúdo Central com título e escolha */}
          <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-xl font-bold text-center mb-6">
              Cadastrar Usuário
            </h1>

            <p className="text-gray-700 font-medium text-lg text-center mb-4">
              Deseja cadastrar um:
            </p>

            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setTipoCadastro("morador")}
                className="w-32 h-32 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-[#26c9a8] hover:shadow-md transition-all flex flex-col items-center justify-center gap-2"
              >
                <FiUser size={32} className="text-[#26c9a8]" />
                <span className="font-semibold text-gray-700">Morador</span>
              </button>
              <button
                onClick={() => setTipoCadastro("visitante")}
                className="w-32 h-32 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-[#26c9a8] hover:shadow-md transition-all flex flex-col items-center justify-center gap-2"
              >
                <FiUsers size={32} className="text-[#26c9a8]" />
                <span className="font-semibold text-gray-700">Visitante</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {tipoCadastro === "morador" && (
        <div className="min-h-screen bg-gray-50">
          <div className="sticky top-0 z-20 bg-white border-b px-4 sm:px-6 md:px-8 py-2 flex justify-between items-center shadow-sm">
            <Button
              type="button"
              onClick={() => router.push("/users")}
              disabled={isLoading}
              variant="ghost"
              className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
            >
              <BsChevronDoubleLeft size={16} />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => setTipoCadastro("")}
                variant="outline"
                className="text-sm"
              >
                Alterar tipo de cadastro
              </Button>
              <Button
                type="submit"
                form="addUserForm"
                disabled={isLoading}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
              >
                <FiSave size={16} />
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">
              Adicionar usuário
            </h1>

            {apiError && (
              <div
                className={`mb-4 p-4 rounded ${
                  apiError.includes("sucesso")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {apiError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              id="addUserForm"
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex flex-col w-full sm:w-1/2">
                  <label
                    htmlFor="name"
                    className="mb-2 font-medium text-gray-700"
                  >
                    Nome
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col w-full sm:w-1/2">
                  <label
                    htmlFor="email"
                    className="mb-2 font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="usuario@condominio.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex flex-col w-full sm:w-1/2">
                  <label
                    htmlFor="phone"
                    className="mb-2 font-medium text-gray-700"
                  >
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="(99) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => {
                      // Remove tudo que não for número
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      setFormData({
                        ...formData,
                        phone: formatPhone(onlyNumbers),
                      });
                    }}
                    disabled={isLoading}
                    inputMode="numeric" // Mostra teclado numérico no mobile
                    pattern="[0-9]*" // Força números
                  />
                </div>
                <div className="flex flex-col w-full sm:w-1/2">
                  <label
                    htmlFor="document"
                    className="mb-2 font-medium text-gray-700"
                  >
                    Documento (CPF/RG)
                  </label>
                  <Input
                    id="document"
                    name="document"
                    placeholder="000.000.000-00"
                    value={formData.document}
                    onChange={(e) => {
                      // Remove tudo que não é número
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      setFormData({
                        ...formData,
                        document: formatCPF(onlyNumbers),
                      });
                    }}
                    disabled={isLoading}
                    inputMode="numeric" // Exibe teclado numérico no mobile
                    pattern="[0-9]*" // Ajuda navegadores a sugerir números
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex flex-col w-full sm:w-1/2">
                  <label
                    htmlFor="accessLevel"
                    className="mb-2 font-medium text-gray-700"
                  >
                    Nível de Acesso
                  </label>
                  <select
                    id="accessLevel"
                    name="accessLevel"
                    value={formData.accessLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, accessLevel: e.target.value })
                    }
                    disabled={isLoading}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Selecione</option>
                    <option value="funcionario">Funcionário</option>
                    <option value="morador">Morador</option>
                    <option value="sindico">Síndico</option>
                  </select>
                </div>

                {formData.accessLevel &&
                  formData.accessLevel !== "funcionario" && (
                    <div className="flex flex-col w-full sm:w-1/2">
                      <label className="mb-2 font-medium text-gray-700">
                        Buscar Apartamento
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Bloco"
                          value={bloco}
                          onChange={(e) => setBloco(e.target.value)}
                          disabled={isLoading}
                          className="border border-gray-300 w-full"
                        />
                        <Input
                          placeholder="Número"
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                          disabled={isLoading}
                          className="border border-gray-300 w-full"
                        />
                        <Button
                          type="button"
                          onClick={buscarApartamento}
                          disabled={isLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
                        >
                          <FiSearch size={20} />
                        </Button>
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex flex-col w-full sm:w-1/2">
                  <label
                    htmlFor="codigoRFID"
                    className="mb-2 font-medium text-gray-700"
                  >
                    Código RFID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="codigoRFID"
                      name="codigoRFID"
                      placeholder="Ex: ABCD1234"
                      value={formData.codigoRFID}
                      readOnly
                      className="border border-gray-300 focus:border-indigo-500 flex-grow"
                    />
                    <Button
                      type="button"
                      onClick={handleReadRFID}
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
                    >
                      {isLoading ? "Lendo..." : "Ler RFID"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
