# Configuración del Backend - Sepolia Faucet

## ✅ Tareas Completadas

### 1. Dependencias Instaladas
- ✅ `ethers` (v6.15.0) - Ya estaba instalado
- ✅ `@supabase/supabase-js` - Instalado exitosamente

### 2. Base de Datos (Supabase)
- ✅ Tabla `faucet_requests` creada con:
  - `wallet_address` (TEXT, PRIMARY KEY)
  - `last_requested_at` (TIMESTAMPTZ, NOT NULL)

### 3. API Endpoint
- ✅ Archivo creado: `app/api/requestSepolia/route.ts`
- ✅ Lógica completa implementada con:
  - Validación de direcciones Ethereum
  - Verificación de cooldown de 24 horas
  - Envío de 0.01 ETH
  - Manejo de errores (fondos insuficientes, etc.)
  - Actualización de base de datos con upsert

## 🔧 Variables de Entorno Requeridas

Necesitas configurar las siguientes variables de entorno:

### Para Desarrollo Local (`.env.local`)
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase Configuration
SUPABASE_URL=https://zwdwwnufctahmiskhfkj.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui

# Faucet Configuration
FAUCET_PRIVATE_KEY=0984ed5f3f40a2a5e763fd03cc27f355afd43f46ac6b4b1619d42342281a338b
SEPOLIA_ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/W-kdHewyyg5rrk9RGYtqI
```

**IMPORTANTE:** Necesitas obtener `SUPABASE_SERVICE_KEY` desde tu dashboard de Supabase:
1. Ve a: https://supabase.com/dashboard/project/zwdwwnufctahmiskhfkj/settings/api
2. Copia la clave `service_role` (NO la clave `anon`)

### Para Producción (Vercel)
Una vez que despliegues tu proyecto a Vercel, configura las mismas variables en:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega cada variable con su valor correspondiente

## 🚀 Cómo Usar el Endpoint

### Request
```bash
POST /api/requestSepolia
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Respuestas

#### ✅ Éxito (200)
```json
{
  "success": true,
  "message": "Se han enviado 0.01 ETH a tu dirección",
  "txHash": "0x..."
}
```

#### ❌ Dirección Inválida (400)
```json
{
  "error": "Dirección de Ethereum inválida"
}
```

#### ⏱️ Cooldown Activo (429)
```json
{
  "error": "Debes esperar X hora(s) para volver a pedir",
  "timeRemaining": 43200000
}
```

#### 💸 Sin Fondos (500)
```json
{
  "error": "El Faucet no tiene fondos suficientes"
}
```

## 📝 Notas de Seguridad

- ✅ Las claves privadas NUNCA están en el código
- ✅ Se usa `service_role` key para operaciones de backend
- ✅ Validación de direcciones Ethereum
- ✅ Sistema de cooldown para prevenir abuso
- ✅ Manejo robusto de errores

## 🧪 Pruebas

Para probar localmente:

1. Configura tu `.env.local` con todas las variables
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Haz una petición POST a `http://localhost:3000/api/requestSepolia`

## 📦 Próximos Pasos

1. Obtén tu `SUPABASE_SERVICE_KEY` del dashboard de Supabase
2. Crea el archivo `.env.local` con todas las variables
3. Prueba el endpoint localmente
4. Despliega a Vercel
5. Configura las variables de entorno en Vercel
