#!/usr/bin/env node
import { SquareCloudAPI } from "@squarecloud/api";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createRequire } from 'node:module';

// Solução para importar CommonJS como ESM
const require = createRequire(import.meta.url);
const squareCloud = require('@squarecloud/api');
const { SquareCloudAPI } = squareCloud;

console.log("Iniciando processo de deploy...");

async function main() {
  try {
    if (!process.env.SQUARE_API_KEY || !process.env.API_ID_KEY) {
      throw new Error("Variáveis de ambiente SQUARE_API_KEY e API_ID_KEY são obrigatórias");
    }

    const api = new SquareCloudAPI(process.env.SQUARE_API_KEY);
    const app = await api.applications.get(process.env.API_ID_KEY);

    console.log("Parando aplicação...");
    const stopped = await app.stop();
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = join(__dirname, "app.zip");

    console.log("Verificando arquivo app.zip...");
    const fs = await import('node:fs/promises');
    try {
      await fs.access(filePath);
    } catch {
      throw new Error("Arquivo app.zip não encontrado");
    }

    if (stopped) {
      console.log("Realizando upload...");
      const success = await app.commit(filePath, "app.zip");

      if (success) {
        console.log("Iniciando aplicação...");
        const started = await app.start();
        console.log("✅ Aplicação iniciada com sucesso:", started);
        console.log("🚀 Deploy concluído com sucesso!");
        return;
      }
      throw new Error("Upload falhou");
    }
    throw new Error("Aplicação não foi parada corretamente");
  } catch (error) {
    console.error("❌ Erro no deploy:", error.message);
    process.exit(1);
  }
}

main();