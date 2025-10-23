import { NextResponse } from "next/server";
import { ethers } from "ethers";

// Simulación local (sin Supabase aún)
const claims: Record<string, number> = {}; // wallet → timestamp

export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();

    // Validación básica de wallet
    if (!wallet || !ethers.isAddress(wallet)) {
      return NextResponse.json({ message: "❌ Wallet inválida" }, { status: 400 });
    }

    const now = Date.now();
    const lastClaim = claims[wallet];

    // Si reclamó hace menos de 24 horas (86_400_000 ms)
    if (lastClaim && now - lastClaim < 86_400_000) {
      const hoursLeft = Math.ceil((86_400_000 - (now - lastClaim)) / 3600000);
      return NextResponse.json({ message: `⏳ Espera ${hoursLeft}h antes de volver a reclamar` });
    }

    // Aquí más adelante se enviará la transacción real
    // Por ahora solo simulamos
    claims[wallet] = now;
    const fakeTxHash = `0x${Math.random().toString(16).substring(2, 10)}FAKEHASH`;

    return NextResponse.json({
      message: `✅ Simulación: 0.01 Sepolia enviada (${fakeTxHash})`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "❌ Error interno del servidor" },
      { status: 500 }
    );
  }
}
