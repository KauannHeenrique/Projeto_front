"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi"; // ícone lupa

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

  const API_URL = "http://localhost:5263";

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
    queryParams.append("bloco", bloco);    // sempre adiciona, mesmo vazio
    queryParams.append("numero", numero);  // sempre adiciona, mesmo vazio

      const url = `${API_URL}/api/Apartamento/BuscarApartamentoPor?${queryParams.toString()}`;
      console.log("URL da requisição:", url);  // Aqui imprime a URL string
const response = await fetch(url);
console.log("Resposta da API:", response); // Aqui imprime o objeto Response

    const data = await response.json();
    console.log("Dados recebidos da API:", data);


      if (response.ok && Array.isArray(data) && data.length > 0) {
  setFormData({ ...formData, apartmentId: data[0].id.toString() });
  setApiError("Apartamento encontrado com sucesso!");
} else {
  setFormData({ ...formData, apartmentId: "" });
  setApiError("Apartamento não encontrado.");
}
    } catch (err) {
      setApiError("Erro ao buscar apartamento.");
      console.error(err);
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

    const apartmentIdNum = parseInt(formData.apartmentId);
    if (!formData.apartmentId.trim()) newErrors.apartmentId = "O apartamento é obrigatório.";
    else if (isNaN(apartmentIdNum) || apartmentIdNum <= 0) newErrors.apartmentId = "ID inválido.";

    const validAccessLevels = ["funcionario", "sindico", "morador"];
    if (!validAccessLevels.includes(formData.accessLevel)) newErrors.accessLevel = "Selecione um nível válido.";

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
      const response = await fetch("http://192.168.1.87/read-rfid");
      const data = await response.json();

      if (data.uid) {
        setFormData({ ...formData, codigoRFID: data.uid });
        setApiError("Tag lida com sucesso!");
      } else {
        setFormData({ ...formData, codigoRFID: "" });
        setApiError("Nenhuma tag detectada.");
      }
    } catch (err) {
      setApiError("Erro ao comunicar com o ESP32.");
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
        ApartamentoId: parseInt(formData.apartmentId) || 0,
        CodigoRFID: formData.codigoRFID || null,
        Senha: "default123",
        Status: true,
      };

      const response = await fetch(`${API_URL}/api/Usuario/AdicionarUsuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      const data = await response.json();
      if (response.ok) {
        setApiError("Usuário criado com sucesso!");
        setTimeout(() => router.push("/usuarios"), 2000);
      } else {
        setApiError(data.mensagem || "Falha ao criar usuário");
      }
    } catch (err) {
      setApiError("Erro ao conectar com a API");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Adicionar Usuário</h1>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}

          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}

          <Input
            name="phone"
            placeholder="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
            disabled={isLoading}
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}

          <Input
            name="document"
            placeholder="Documento (CPF/RG)"
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
          />
          {errors.document && <p className="text-sm text-red-600">{errors.document}</p>}

          {/* Campo apartamentoId com netcode ao lado */}
          <div className="flex items-center gap-2 relative">
  <Input
    name="apartmentId"
    placeholder="ID do Apartamento"
    value={formData.apartmentId}
    readOnly
    disabled
    className="flex-grow"
  />
  <div className="relative">
    <button
      type="button"
      onClick={() => setPopoverOpen((open) => !open)}
      aria-label="Buscar apartamento"
      className="p-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <FiSearch size={20} />
    </button>

    {popoverOpen && (
      <div
        ref={popoverRef}
        className="absolute right-full top-1/2 -translate-y-1/2 ml-2 w-64 p-4 bg-white border border-gray-300 rounded shadow-lg z-50"
      >
        <Input
          name="bloco"
          placeholder="Bloco"
          value={bloco}
          onChange={(e) => setBloco(e.target.value)}
          disabled={isLoading}
        />
        <Input
          name="numero"
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          disabled={isLoading}
          className="mt-2"
        />
        <Button
          type="button"
          onClick={buscarApartamento}
          className="mt-3 w-full bg-indigo-500 hover:bg-indigo-600"
          disabled={isLoading}
        >
          Buscar
        </Button>
      </div>
    )}
  </div>
</div>
          {errors.apartmentId && (
            <p className="text-sm text-red-600">{errors.apartmentId}</p>
          )}

          <Input
            name="codigoRFID"
            placeholder="Código RFID"
            value={formData.codigoRFID}
            readOnly
            disabled={isLoading}
          />
          {errors.codigoRFID && (
            <p className="text-sm text-red-600">{errors.codigoRFID}</p>
          )}

          <Button
            type="button"
            onClick={handleReadRFID}
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Lendo..." : "Ler Tag RFID"}
          </Button>

          <select
            name="accessLevel"
            value={formData.accessLevel}
            onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
            className="w-full p-2 border rounded"
            disabled={isLoading}
            required
          >
            <option value="" disabled>
              Selecione o nível de acesso
            </option>
            <option value="morador">Morador</option>
            <option value="funcionario">Funcionário</option>
            <option value="sindico">Síndico</option>
          </select>
          {errors.accessLevel && (
            <p className="text-sm text-red-600">{errors.accessLevel}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
