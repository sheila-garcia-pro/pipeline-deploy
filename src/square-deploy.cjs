// square-deploy.cjs
const squareCloud = require('@squarecloud/api');

// Verificação detalhada da importação
console.log('[1/7] Verificando importação do pacote...');
if (!squareCloud) {
  throw new Error('Pacote @squarecloud/api não foi importado corretamente');
}

// Extração do construtor com fallbacks
const SquareCloudAPI = squareCloud.SquareCloudAPI || squareCloud.default?.SquareCloudAPI || squareCloud;
if (!SquareCloudAPI) {
  throw new Error('Não foi possível encontrar o construtor SquareCloudAPI');
}

async function deploy() {
  try {
    console.log('[2/7] Verificando variáveis de ambiente...');
    if (!process.env.SQUARE_API_KEY || !process.env.API_ID_KEY) {
      throw new Error('Variáveis SQUARE_API_KEY e API_ID_KEY são obrigatórias');
    }

    console.log('[3/7] Criando instância da API...');
    const api = new SquareCloudAPI(process.env.SQUARE_API_KEY);
    if (!api) {
      throw new Error('Falha ao criar instância da API');
    }

    console.log('[4/7] Obtendo aplicação...');
    const app = await api.applications.get(process.env.API_ID_KEY);
    if (!app) {
      throw new Error('Falha ao obter aplicação');
    }

    console.log('[5/7] Parando aplicação...');
    const stopped = await app.stop();
    if (!stopped) {
      throw new Error('Falha ao parar aplicação');
    }

    console.log('[6/7] Preparando upload...');
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, 'app.zip');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo app.zip não encontrado em ${filePath}`);
    }

    console.log('[7/7] Realizando upload...');
    const success = await app.commit(filePath, 'app.zip');
    if (!success) {
      throw new Error('Upload falhou');
    }

    console.log('✅ Reiniciando aplicação...');
    await app.start();
    console.log('🚀 Deploy concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Falha crítica:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    process.exit(1);
  }
}

deploy();