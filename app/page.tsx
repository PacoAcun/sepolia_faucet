"use client";
import { useState } from "react";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const requestTokens = async () => {
    if (!wallet) {
      setMessage("Ingresa una dirección válida");
      return;
    }
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 text-white p-6 gap-6">
      {/* Logo */}
      <img
        src="/seph.png"
        alt="Sepolia logo"
        className="w-32 mb-6 opacity-90 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
      />

      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Sepolia Faucet
        </h1>
        <p className="text-gray-400 text-sm">
          Recibe{" "}
          <span className="text-blue-400 font-semibold">0.01 Sepolia</span>{" "}
          cada 24 horas
        </p>
      </div>

      {/* Input */}
      <input
        type="text"
        placeholder="Tu wallet (0x...)"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        className="w-80 p-3 rounded-lg bg-gray-800/80 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />

      {/* Button */}
      <button
        onClick={requestTokens}
        disabled={loading}
        className={`w-80 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-blue-500/20"
        }`}
      >
        {loading ? "Enviando..." : "Solicitar 0.01 Sepolia"}
      </button>

      {/* Message */}
      {message && (
        <p
          className={`text-sm text-center mt-2 ${
            message.includes("✅")
              ? "text-green-400"
              : message.includes("⏳")
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </main>
  );
}
