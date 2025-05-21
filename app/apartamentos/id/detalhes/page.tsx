"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DetalhesApartamentoPage() {
  const router = useRouter();
  const { id } = useParams();

  console.log("🚀 ID capturado da URL:", id); // 👈 Debug 1

  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = "http://localhost:5263";

  useEffect(() => {
    if (!id) {
      console.error("❌ ID não encontrado na URL!");
      return;
    }

    const fetchApartamento = async () => {
      try {
        const url = `${API_URL}/api/Apartamento/BuscarApartamentoPorId/${id}`;
        console.log("🔍 Buscando dados em:", url); // 👈 Debug 2

        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro ao buscar apartamento");

        const data = await res.json();
        console.log("✅ Dados carregados:", data); // 👈 Debug 3

        setBloco(data.bloco || "");
        setNumero(data.numero || "");
      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
        setError("Erro ao carregar apartamento");
      } finally {
        setLoading(false);
      }
    };

    fetchApartamento();
  }, [id]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/Apartamento/AtualizarApartamento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartamentoId: id, bloco, numero }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar apartamento");
      setSuccess("Apartamento atualizado com sucesso!");
      setTimeout(() => router.push("/apartamentos"), 1500);
    } catch (err) {
      setError("Erro ao atualizar apartamento");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-4">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Apartamento</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <div className="space-y-4">
        <Input placeholder="Bloco" value={bloco} onChange={(e) => setBloco(e.target.value)} />
        <Input placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
        <div className="flex justify-between mt-6">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
