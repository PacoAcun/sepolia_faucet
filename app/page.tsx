"use client";
import { useState } from "react";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "cooldown" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

  const requestTokens = async () => {
    if (!wallet) {
      setStatus("error");
      setTxHash(null);
      setMessage("Ingresa una dirección válida (0x...)");
      return;
    }
    setLoading(true);
    setStatus("processing");
    setTxHash(null);
    setMessage("⏳ Procesando tu solicitud...");

    try {
      const res = await fetch("/api/requestSepolia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: wallet }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (typeof data?.timeRemaining === "number") {
          const hours = Math.ceil(data.timeRemaining / (60 * 60 * 1000));
          setStatus("cooldown");
          setMessage(`Debes esperar ${hours} hora(s) para volver a pedir`);
        } else {
          setStatus("error");
          setMessage(data?.error || "Ocurrió un error al procesar tu solicitud");
        }
      } else {
        setStatus("success");
        setTxHash(typeof data?.txHash === "string" ? data.txHash : null);
        setMessage(data?.message || "Solicitud enviada");
      }
    } catch {
      setStatus("error");
      setMessage("⚠️ Error de conexión con el faucet");
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

      {message && (
        <div
          className={
            `w-80 mt-3 rounded-lg border p-3 text-sm text-center transition-colors ` +
            (status === "success"
              ? "border-emerald-600/40 bg-emerald-900/20 text-emerald-300"
              : status === "cooldown"
              ? "border-yellow-600/40 bg-yellow-900/20 text-yellow-300"
              : status === "processing"
              ? "border-blue-600/40 bg-blue-900/20 text-blue-300"
              : "border-red-600/40 bg-red-900/20 text-red-300")
          }
        >
          <div className="mb-2">{message}</div>
          {status === "success" && txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center rounded-md px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-blue-500/20 text-white font-medium"
            >
              Ver en Etherscan
            </a>
          )}
        </div>
      )}
    </main>
  );
}
