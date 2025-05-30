
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

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

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const API_URL = "http://172.20.10.2:5263";

  // Fechar popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const formatCPF = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

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
    if (!bloco.trim() || !numero.trim()) {
      setApiError("Informe o bloco e número do apartamento.");
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("bloco", bloco);
      queryParams.append("numero", numero);

      const url = `${API_URL}/api/Apartamento/BuscarApartamentoPor?${queryParams.toString()}`;
      console.log("Buscando apartamento - URL:", url);
      const response = await fetch(url);
      console.log("Resposta da API (apartamento):", response.status, response.statusText);

      const data = await response.json();
      console.log("Dados recebidos da API (apartamento):", data);

      if (response.ok && Array.isArray(data) && data.length > 0) {
        setFormData({ ...formData, apartmentId: data[0].id.toString() });
        setApiError("Apartamento encontrado com sucesso!");
      } else {
        setFormData({ ...formData, apartmentId: "" });
        setApiError("Apartamento não encontrado.");
      }
    } catch (err) {
      setApiError("Erro ao buscar apartamento.");
      console.error("Erro ao buscar apartamento:", err);
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "O nome é obrigatório.";
    else if (formData.name.length < 2) newErrors.name = "O nome deve ter pelo menos 2 caracteres.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "O email é obrigatório.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Email inválido.";

    const phoneDigits = formData.phone.replace(/\D/g, "");
    const phoneRegex = /^\d{2}9\d{8}$/;
    if (!phoneDigits) newErrors.phone = "O telefone é obrigatório.";
    else if (!phoneRegex.test(phoneDigits)) newErrors.phone = "Telefone inválido.";

    const documentDigits = formData.document.replace(/\D/g, "");
    const rgRegex = /^[a-zA-Z0-9]{1,12}$/;
    if (!formData.document.trim()) newErrors.document = "O documento é obrigatório.";
    else if (documentDigits.length === 11 && !isValidCPF(formData.document)) {
      newErrors.document = "CPF inválido.";
    } else if (documentDigits.length !== 11 && !rgRegex.test(documentDigits)) {
      newErrors.document = "RG inválido.";
    }

    const validAccessLevels = ["funcionario", "sindico", "morador"];
    if (!validAccessLevels.includes(formData.accessLevel)) newErrors.accessLevel = "Selecione um nível válido.";

    if (formData.accessLevel !== "funcionario") {
      const apartmentIdNum = parseInt(formData.apartmentId);
      if (!formData.apartmentId.trim()) newErrors.apartmentId = "O apartamento é obrigatório.";
      else if (isNaN(apartmentIdNum) || apartmentIdNum <= 0) newErrors.apartmentId = "ID inválido.";
    }

    if (formData.codigoRFID && !/^[a-zA-Z0-9]{8}$/.test(formData.codigoRFID))
      newErrors.codigoRFID = "O código RFID deve ter 8 caracteres alfanuméricos.";

    return newErrors;
  };

  const handleReadRFID = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setApiError(null);
    setErrors((prev) => ({ ...prev, codigoRFID: undefined }));

    try {
      const response = await fetch("http://172.20.10.4/read-rfid");
      console.log("Resposta da API (RFID):", response.status, response.statusText);
      const data = await response.json();
      console.log("Dados recebidos da API (RFID):", data);

      if (data.uid) {
        setFormData({ ...formData, codigoRFID: data.uid });
        setApiError("Tag lida com sucesso!");
      } else {
        setFormData({ ...formData, codigoRFID: "" });
        setApiError("Nenhuma tag detectada.");
      }
    } catch (err) {
      setApiError("Erro ao comunicar com o leitor RFID.");
      console.error("Erro ao ler RFID:", err);
      setFormData({ ...formData, codigoRFID: "" });
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
        funcionario: 1,
        sindico: 3,
        morador: 2,
      };

      const usuario = {
        Nome: formData.name,
        Email: formData.email,
        Telefone: formData.phone.replace(/\D/g, ""),
        Documento: formData.document.replace(/[\.\-]/g, ""),
        NivelAcesso: nivelAcessoMap[formData.accessLevel],
        ApartamentoId: formData.accessLevel === "funcionario" ? null : parseInt(formData.apartmentId) || null,
        CodigoRFID: formData.codigoRFID || null,
        Senha: "default123",
        Status: true,
      };

      console.log("Enviando dados para a API:", usuario);

      const response = await fetch(`${API_URL}/api/Usuario/AdicionarUsuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      console.log("Resposta da API (cadastro):", response.status, response.statusText);
      const data = await response.json();
      console.log("Dados recebidos da API (cadastro):", data);

      if (response.ok) {
        setApiError("Morador cadastrado com sucesso!");
        setTimeout(() => router.push("/usuarios"), 2000);
      } else {
        setApiError(data.mensagem || `Falha ao cadastrar morador: ${response.statusText}`);
      }
    } catch (err) {
      setApiError("Erro ao conectar com a API. Verifique sua conexão ou tente novamente.");
      console.error("Erro ao cadastrar morador:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Adicionar Morador</h1>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Linha 1: Nome e Email */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex flex-col w-full sm:w-1/2">
              <label htmlFor="name" className="mb-2 font-medium text-gray-700">Nome</label>
              <Input
                id="name"
                name="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                className="border border-gray-300 focus:border-indigo-500"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div className="flex flex-col w-full sm:w-1/2">
              <label htmlFor="email" className="mb-2 font-medium text-gray-700">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="morador@condominio.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                className="border border-gray-300 focus:border-indigo-500"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Linha 2: Telefone e Documento */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex flex-col w-full sm:w-1/2">
              <label htmlFor="phone" className="mb-2 font-medium text-gray-700">Telefone</label>
              <Input
                id="phone"
                name="phone"
                placeholder="(99) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                disabled={isLoading}
                className="border border-gray-300 focus:border-indigo-500"
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>

            <div className="flex flex-col w-full sm:w-1/2">
              <label htmlFor="document" className="mb-2 font-medium text-gray-700">Documento (CPF/RG)</label>
              <Input
                id="document"
                name="document"
                placeholder="000.000.000-00"
                value={formData.document}
                onChange={(e) => {
                  let value = e.target.value;
                  const digits = value.replace(/\D/g, "");
                  if (digits.length <= 11 && /^\d*$/.test(digits)) {
                    value = formatCPF(value);
                  }
                  setFormData({ ...formData, document: value });
                }}
                disabled={isLoading}
                className="border border-gray-300 focus:border-indigo-500"
              />
              {errors.document && <p className="text-sm text-red-600 mt-1">{errors.document}</p>}
            </div>
          </div>

          {/* Linha 3: Código RFID e Buscar Apartamento */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex flex-col w-full sm:w-1/2">
              <label htmlFor="codigoRFID" className="mb-2 font-medium text-gray-700">Código RFID</label>
              <div className="flex gap-2">
                <Input
                  id="codigoRFID"
                  name="codigoRFID"
                  placeholder="Ex: ABCD1234"
                  value={formData.codigoRFID}
                  onChange={(e) => setFormData({ ...formData, codigoRFID: e.target.value.toUpperCase() })}
                  disabled={isLoading}
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
              {errors.codigoRFID && <p className="text-sm text-red-600 mt-1">{errors.codigoRFID}</p>}
            </div>

            <div className="flex flex-col w-full sm:w-1/2">
              <label className="mb-2 font-medium text-gray-700">Buscar Apartamento</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Bloco"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  disabled={isLoading || formData.accessLevel === "funcionario"}
                  className="border border-gray-300 w-full"
                />
                <Input
                  placeholder="Número"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  disabled={isLoading || formData.accessLevel === "funcionario"}
                  className="border border-gray-300 w-full"
                />
                <Button
                  type="button"
                  onClick={buscarApartamento}
                  disabled={isLoading || formData.accessLevel === "funcionario"}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
                >
                  <FiSearch size={20} />
                </Button>
              </div>
              {errors.apartmentId && <p className="text-sm text-red-600 mt-1">{errors.apartmentId}</p>}
            </div>
          </div>

          {/* Linha 4: Nível de Acesso, Voltar e Salvar */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="flex flex-col w-full sm:w-1/2">
              <label htmlFor="accessLevel" className="mb-2 font-medium text-gray-700">Nível de Acesso</label>
              <select
                id="accessLevel"
                name="accessLevel"
                value={formData.accessLevel}
                onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                disabled={isLoading}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Selecione</option>
                <option value="funcionario">Funcionário</option>
                <option value="morador">Morador</option>
                <option value="sindico">Síndico</option>
              </select>
              {errors.accessLevel && <p className="text-sm text-red-600 mt-1">{errors.accessLevel}</p>}
            </div>
            <div className="flex sm:ml-auto gap-4">
              <Button
                type="button"
                onClick={() => router.push("/usuarios")}
                disabled={isLoading}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold w-full sm:w-auto"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded font-semibold w-full sm:w-auto"
              >
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
