import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

// Constante para el periodo de cooldown (24 horas en milisegundos)
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000;

// Cantidad a enviar: 0.01 ETH
const AMOUNT_TO_SEND = '0.01';

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener la dirección del cuerpo de la petición
    const body = await request.json();
    const { address } = body;

    // 2. Validar que la dirección sea válida
    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Dirección de Ethereum inválida' },
        { status: 400 }
      );
    }

    // 3. Inicializar el cliente de Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuración de Supabase no disponible' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Verificar el cooldown (24 horas)
    const { data: existingRequest, error: fetchError } = await supabase
      .from('faucet_requests')
      .select('last_requested_at')
      .eq('wallet_address', address)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 es el código cuando no se encuentra el registro
      console.error('Error al consultar la base de datos:', fetchError);
      return NextResponse.json(
        { error: 'Error al verificar el historial de solicitudes' },
        { status: 500 }
      );
    }

    if (existingRequest) {
      const lastRequestedAt = new Date(existingRequest.last_requested_at).getTime();
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestedAt;

      if (timeSinceLastRequest < COOLDOWN_PERIOD) {
        const timeRemaining = COOLDOWN_PERIOD - timeSinceLastRequest;
        const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));

        return NextResponse.json(
          {
            error: `Debes esperar ${hoursRemaining} hora(s) para volver a pedir`,
            timeRemaining: timeRemaining,
          },
          { status: 429 }
        );
      }
    }

    // 5. Configurar el provider y la wallet
    const alchemyUrl = process.env.SEPOLIA_ALCHEMY_URL;
    const privateKey = process.env.FAUCET_PRIVATE_KEY;

    if (!alchemyUrl || !privateKey) {
      return NextResponse.json(
        { error: 'Configuración del faucet no disponible' },
        { status: 500 }
      );
    }

    const provider = new ethers.JsonRpcProvider(alchemyUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // 6. Enviar la transacción
    let tx;
    try {
      tx = await wallet.sendTransaction({
        to: address,
        value: ethers.parseEther(AMOUNT_TO_SEND),
      });
    } catch (error: any) {
      console.error('Error al enviar la transacción:', error);

      // Verificar si es un error de fondos insuficientes
      if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
        return NextResponse.json(
          { error: 'El Faucet no tiene fondos suficientes' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Error al enviar la transacción' },
        { status: 500 }
      );
    }

    // 7. Actualizar la base de datos con upsert
    const { error: upsertError } = await supabase
      .from('faucet_requests')
      .upsert(
        {
          wallet_address: address,
          last_requested_at: new Date().toISOString(),
        },
        {
          onConflict: 'wallet_address',
        }
      );

    if (upsertError) {
      console.error('Error al actualizar la base de datos:', upsertError);
      // No retornamos error aquí porque la transacción ya se envió
    }

    // 8. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: `Se han enviado ${AMOUNT_TO_SEND} ETH a tu dirección`,
        txHash: tx.hash,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
