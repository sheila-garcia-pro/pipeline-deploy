#!/usr/bin/env node
import squareCloud from '@squarecloud/api';
const { SquareCloudAPI } = squareCloud;

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import fs from 'node:fs/promises';

console.log('[1/6] Iniciando processo de deploy...');

async function deploy() {
  try {
    // Verificação das variáveis de ambiente
    if (!process.env.SQUARE_API_KEY || !process.env.API_ID_KEY) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    console.log('[2/6] Conectando à Square Cloud API...');
    const api = new SquareCloudAPI(process.env.SQUARE_API_KEY);
    
    console.log('[3/6] Obtendo aplicação...');
    const app = await api.applications.get(process.env.API_ID_KEY);

    console.log('[4/6] Parando aplicação...');
    const stopped = await app.stop();
    if (!stopped) throw new Error('Falha ao parar a aplicação');

    // Preparação do arquivo
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const zipPath = join(__dirname, 'app.zip');

    console.log('[5/6] Verificando arquivo app.zip...');
    try {
      await fs.access(zipPath);
    } catch {
      throw new Error(`Arquivo app.zip não encontrado em ${zipPath}`);
    }

    console.log('[6/6] Realizando upload...');
    const success = await app.commit(zipPath, 'app.zip');
    if (!success) throw new Error('Upload falhou');

    console.log('✅ Deploy realizado com sucesso!');
    console.log('Reiniciando aplicação...');
    await app.start();
    
  } catch (error) {
    console.error('❌ Erro durante o deploy:', error.message);
    process.exit(1);
  }
}

deploy();