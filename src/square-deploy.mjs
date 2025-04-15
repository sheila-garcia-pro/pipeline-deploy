#!/usr/bin/env node
// Correção da importação para CommonJS
import pkg from '@squarecloud/api';
const { SquareCloudAPI } = pkg;

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import fs from 'node:fs/promises';

console.log('Iniciando deploy na Square Cloud...');

async function deploy() {
  try {
    // Verifica variáveis de ambiente
    if (!process.env.SQUARE_API_KEY || !process.env.API_ID_KEY) {
      throw new Error('Variáveis SQUARE_API_KEY e API_ID_KEY são obrigatórias');
    }

    const token = process.env.SQUARE_API_KEY;
    const api_id = process.env.API_ID_KEY;
    
    console.log('Conectando à API...');
    const api = new SquareCloudAPI(token);
    const app = await api.applications.get(api_id);

    console.log('Parando aplicação...');
    const stopped = await app.stop();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const fileName = 'app.zip';
    const filePath = join(__dirname, fileName);

    console.log(`Verificando arquivo ${filePath}...`);
    try {
      await fs.access(filePath, fs.constants.R_OK);
    } catch {
      throw new Error(`Arquivo ${fileName} não encontrado ou não pode ser lido`);
    }

    if (stopped) {
      console.log('Enviando nova versão...');
      const success = await app.commit(filePath, fileName);

      if (success) {
        console.log('Iniciando aplicação...');
        const started = await app.start();
        console.log('Deploy concluído com sucesso!', { started });
        return true;
      }
      throw new Error('Falha no upload');
    }
    throw new Error('Aplicação não foi parada corretamente');
  } catch (error) {
    console.error('Erro no deploy:', error.message);
    process.exit(1);
  }
}

deploy();