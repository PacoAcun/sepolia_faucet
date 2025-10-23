"use client";
import { useState } from "react";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const requestTokens = async () => {
    if (!wallet) return setMessage("Ingresa una dirección válida");
    setLoading(true);
    setMessage("Procesando...");

    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("Error de conexión con el faucet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 gap-4">
      <h1 className="text-4xl font-bold mb-2">Sepolia Faucet</h1>
      <p className="text-gray-400 mb-6">Recibe 0.01 Sepolia cada 24 horas</p>

      <input
        type="text"
        placeholder="Tu wallet (0x...)"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        className="p-3 w-80 text-black rounded outline-none"
      />

      <button
        onClick={requestTokens}
        disabled={loading}
        className={`px-6 py-2 rounded font-semibold ${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Enviando..." : "Solicitar 0.01 Sepolia"}
      </button>

      {message && (
        <p className="text-sm text-center text-gray-300 max-w-xs mt-3">{message}</p>
      )}
    </main>
  );
}
