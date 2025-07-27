"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { FiSearch, FiSave, FiRefreshCw, FiTrash2, FiAlertTriangle } from "react-icons/fi";
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
  status: string;
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

export default function EditUser() {
  const router = useRouter();
  const { id } = useParams();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    document: "",
    accessLevel: "",
    apartmentId: "",
    codigoRFID: "",
    status: "ativo",
  });
  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleResetPassword = async () => {
  if (!id) return;
  try {
  await api.put(`/Usuario/ResetarSenha/${id}`);
  setApiError("Senha redefinida com sucesso!");
} catch (err: any) {
  const msg = err?.response?.data?.mensagem || "Erro ao redefinir a senha.";
  console.error("Erro ao redefinir senha:", msg);
  setApiError(msg);
}

};


  

  useEffect(() => {
  const fetchUser = async () => {
    //setIsLoading(true);
    try {
  const { data } = await api.get("/Usuario/BuscarUsuarioPor", {
    params: { id }
  });

  const usuario = Array.isArray(data) ? data[0] : data;

  if (!usuario) {
    setApiError("Usuário não encontrado.");
    return;
  }

  setFormData({
    name: usuario.nome || "",
    email: usuario.email || "",
    phone: formatPhone(usuario.telefone || ""),
    document: formatCPF(usuario.documento || ""),
    accessLevel:
      usuario.nivelAcesso === 2
        ? "sindico"
        : usuario.nivelAcesso === 3
        ? "funcionario"
        : usuario.nivelAcesso === 4
        ? "morador"
        : "",
    apartmentId: usuario.apartamentoId?.toString() || "",
    codigoRFID: usuario.codigoRFID || "",
    status: usuario.status ? "ativo" : "inativo",
  });

  setBloco(usuario.apartamento?.bloco ? String(usuario.apartamento.bloco) : "");
  setNumero(usuario.apartamento?.numero ? String(usuario.apartamento.numero) : "");
} catch (err: any) {
  const msg = err?.response?.data?.mensagem || "Erro ao carregar dados do usuário.";
  setApiError(msg);
}

  };

  if (id) fetchUser();
}, [id]);

  useEffect(() => {
    if (formData.accessLevel === "funcionario") {
      setFormData((prev) => ({ ...prev, apartmentId: "" }));
      setBloco("");
      setNumero("");
      setErrors((prev) => ({ ...prev, apartmentId: undefined }));
    }
  }, [formData.accessLevel]);

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

  // Se não for funcionário, forçar busca do apartamento antes de enviar
if (formData.accessLevel !== "funcionario") {
  if (!bloco.trim() || !numero.trim()) {
    setIsLoading(false);
    setApiError("Informe o bloco e número do apartamento.");
    return;
  }

  try {
  const { data } = await api.get("/Apartamento/BuscarApartamentoPor", {
    params: { bloco: bloco.trim().toUpperCase(), numero: numero.trim() },
  });

  if (Array.isArray(data) && data.length > 0) {
    formData.apartmentId = data[0].id.toString();
  } else {
    setIsLoading(false);
    setApiError("Não encontramos nenhum apartamento com o bloco e número informados. Por favor, revise os dados.");
    return;
  }
} catch (err: any) {
  setIsLoading(false);

  if (err.response?.status === 404) {
    setApiError("Apartamento não encontrado. Verifique o bloco e número informados.");
  } else {
    setApiError("Ocorreu um erro inesperado ao buscar o apartamento. Tente novamente mais tarde.");
  }

  return;
}

}


  const nivelAcessoMap: { [key: string]: number } = {
    sindico: 2,
    funcionario: 3,
    morador: 4,
  };

  const usuario = {
  usuarioId: Number(id),
  nome: formData.name,
documento: cleanDocument(formData.document),
  email: formData.email,
  senha: "", // opcional, ou a senha original se mantida
  nivelAcesso: nivelAcessoMap[formData.accessLevel],
telefone: cleanDocument(formData.phone),
  apartamentoId: formData.accessLevel === "funcionario" ? null : parseInt(formData.apartmentId) || null,
  apartamento: null,
  codigoRFID: formData.codigoRFID || null,
  status: formData.status === "ativo",
  isTemporaryPassword: false,
  dataCadastro: new Date().toISOString()
};

  try {
  const { data } = await api.put(`/Usuario/AtualizarUsuario/${id}`, usuario);

  setApiError("Usuário atualizado com sucesso!");
  setTimeout(() => router.push("/users"), 2000);
} catch (err: any) {
  const msg = err?.response?.data?.mensagem || "Erro ao atualizar usuário.";
  console.error("Erro ao atualizar usuário:", msg);
  setApiError(msg);
} finally {
  setIsLoading(false);
}

};
// POP UP para remover usuário
const [mostrarPopupExcluir, setMostrarPopupExcluir] = useState(false);
const [mostrarPopupSalvar, setMostrarPopupSalvar] = useState(false);


  return (
  <div className="min-h-screen bg-gray-50">
    {/* Barra de botões fixa no topo */}
    <div className="sticky top-0 z-20 bg-white border-b px-4 sm:px-6 md:px-8 py-2 flex justify-between items-center shadow-sm">
      {/* Botão Voltar - à esquerda */}
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

      {/* Botões à direita */}
      <div className="flex gap-10">
        
        <Button
          type="button"
          onClick={handleResetPassword}
          disabled={isLoading}
          variant="ghost"
        className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <FiRefreshCw size={16} />
          Redefinir Senha
        </Button>

        {mostrarPopupExcluir && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      {/* Botão fechar */}
      <button
        onClick={() => setMostrarPopupExcluir(false)}
        className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ×
      </button>

      <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center justify-center gap-2">
      <FiAlertTriangle size={20} className="text-red-600" />
      Confirmar exclusão
      <FiAlertTriangle size={20} className="text-red-600" />
      </h2>

      <p className="text-sm text-center text-gray-700 mb-6">
        Tem certeza que deseja excluir este usuário? Essa ação não pode ser desfeita.
      </p>

      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setMostrarPopupExcluir(false)}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Cancelar
        </Button>
        <Button
          onClick={async () => {
            try {
              await api.delete(`/Usuario/ExcluirUsuario/${id}`);
              setApiError("Usuário excluído com sucesso.");
              setMostrarPopupExcluir(false);
              setTimeout(() => router.push("/users/desktop"), 900);
            } catch (err: any) {
              const msg = err?.response?.data?.mensagem || "Erro ao excluir o usuário.";
              console.error("Erro ao excluir:", msg);
              setApiError(msg);
            }
          }}
          className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
        >
          Confirmar
        </Button>
      </div>
    </div>
  </div>
)}


{mostrarPopupSalvar && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      {/* Botão fechar */}
      <button
        onClick={() => setMostrarPopupSalvar(false)}
        className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ×
      </button>

      <h2 className="text-lg font-semibold mb-4 text-black-600 flex items-center justify-center gap-2">
      Confirmar edição?
      </h2>

      

      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setMostrarPopupSalvar(false)}
          className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
        >
          Cancelar
        </Button>
        <Button
  onClick={async () => {
    try {
      const nivelAcessoMap = { sindico: 2, funcionario: 3, morador: 4 };

      const usuario = {
        usuarioId: Number(id),
        nome: formData.name,
        documento: cleanDocument(formData.document),
        email: formData.email,
        telefone: cleanDocument(formData.phone),
        nivelAcesso: nivelAcessoMap[formData.accessLevel],
        apartamentoId:
          formData.accessLevel === "funcionario"
            ? null
            : parseInt(formData.apartmentId) || null,
        codigoRFID: formData.codigoRFID || null,
        status: formData.status === "ativo",
      };

      await api.put(`/Usuario/AtualizarUsuario/${id}`, usuario, {
        headers: { "Content-Type": "application/json" },
      });

      setApiError("Usuário atualizado com sucesso!");
      setMostrarPopupSalvar(false);
      setTimeout(() => router.push("/users/desktop"), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem || "Erro ao salvar alterações.";
      console.error("Erro ao salvar:", msg);
      setApiError(msg);
      setMostrarPopupSalvar(false); // ✅ Fechar modal mesmo com erro
    }
  }}
  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded"
>
  Confirmar
</Button>
      </div>
    </div>
  </div>
)}


        <Button
        type="button"
        onClick={() => setMostrarPopupExcluir(true)}
        disabled={isLoading}
        variant="ghost"
        className="text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1"
        >
        <FiTrash2 size={16} />
        Remover usuário
        </Button>

        <Button
  type="button"
  onClick={async () => {
    if (formData.accessLevel !== "funcionario") {
      if (!bloco.trim() || !numero.trim()) {
        setApiError("Informe o bloco e número do apartamento.");
        return;
      }

      try {
        const { data } = await api.get("/Apartamento/BuscarApartamentoPor", {
          params: { bloco: bloco.trim().toUpperCase(), numero: numero.trim() },
        });

        if (Array.isArray(data) && data.length > 0) {
          setFormData((prev) => ({ ...prev, apartmentId: data[0].id.toString() }));
          setMostrarPopupSalvar(true);
        } else {
          setApiError("Apartamento não encontrado. Verifique os dados informados.");
        }
      } catch {
        setApiError("Erro ao buscar apartamento. Tente novamente.");
      }
    } else {
      setMostrarPopupSalvar(true);
    }
  }}
  disabled={isLoading}
  variant="ghost"
  className="bg-[#26c9a8] hover:bg-[#1fa98a] text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
>
  <FiSave size={16} />
  {isLoading ? "Salvando..." : "Salvar"}
</Button>

       

      </div>
    </div>

    {/* Conteúdo da página */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Editar usuário</h1>

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




      <form onSubmit={handleSubmit} id="editUserForm" className="space-y-6">
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
      />
      {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
    </div>
    <div className="flex flex-col w-full sm:w-1/2">
      <label htmlFor="email" className="mb-2 font-medium text-gray-700">Email</label>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="usuario@condominio.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={isLoading}
      />
      {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
    </div>
  </div>

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
      />
      {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
    </div>
    <div className="flex flex-col w-full sm:w-1/2">
      <label htmlFor="document" className="mb-2 font-medium text-gray-700">Documento (CPF)</label>
      <Input
        id="document"
        name="document"
        placeholder="000.000.000-00"
        value={formData.document}
        onChange={(e) => setFormData({ ...formData, document: formatCPF(e.target.value) })}
        disabled={isLoading}
      />
      {errors.document && <p className="text-sm text-red-600 mt-1">{errors.document}</p>}
    </div>
  </div>

  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
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

    <div className="flex flex-col w-full sm:w-1/2">
      <label htmlFor="status" className="mb-2 font-medium text-gray-700">Status</label>
      <select
        id="status"
        name="status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        disabled={isLoading}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
      >
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
    </div>
  </div>

  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-end">
    {formData.accessLevel && formData.accessLevel !== "funcionario" && (
      <div className="flex flex-col w-full sm:w-1/2">
        <label className="mb-2 font-medium text-gray-700">Buscar Apartamento</label>
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
        </div>
        {errors.apartmentId && <p className="text-sm text-red-600 mt-1">{errors.apartmentId}</p>}
      </div>
    )}

    <div className="flex flex-col w-full sm:w-1/2">
      <label htmlFor="codigoRFID" className="mb-2 font-medium text-gray-700">Código RFID</label>
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
      {errors.codigoRFID && <p className="text-sm text-red-600 mt-1">{errors.codigoRFID}</p>}
    </div>
  </div>
</form>
    </div>
  </div>
);
}