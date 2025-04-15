// square-deploy.cjs
const squareCloud = require('@squarecloud/api');

// Verificação de importação
console.log('Pacote importado:', typeof squareCloud);
console.log('Conteúdo do pacote:', Object.keys(squareCloud));

// Extrai o construtor corretamente
const SquareCloudAPI = squareCloud.SquareCloudAPI || squareCloud.default?.SquareCloudAPI || squareCloud;

async function deploy() {
  try {
    // Verificação das variáveis de ambiente
    if (!process.env.SQUARE_API_KEY || !process.env.API_ID_KEY) {
      throw new Error('Variáveis SQUARE_API_KEY e API_ID_KEY são obrigatórias');
    }

    console.log('Criando instância da API...');
    const api = new SquareCloudAPI(process.env.SQUARE_API_KEY);
    
    console.log('Obtendo aplicação...');
    const app = await api.applications.get(process.env.API_ID_KEY);

    console.log('Parando aplicação...');
    const stopped = await app.stop();
    
    const path = require('path');
    const filePath = path.join(__dirname, 'app.zip');
    console.log('Caminho do arquivo:', filePath);

    // Verifica se o arquivo existe
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo ${filePath} não encontrado`);
    }

    if (stopped) {
      console.log('Realizando upload...');
      const success = await app.commit(filePath, 'app.zip');
      
      if (success) {
        console.log('Iniciando aplicação...');
        const started = await app.start();
        console.log('✅ Deploy concluído com sucesso!');
        console.log('Status:', { started });
        return;
      }
      throw new Error('Upload falhou');
    }
    throw new Error('Aplicação não foi parada corretamente');
  } catch (error) {
    console.error('❌ Erro no deploy:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    process.exit(1);
  }
}

deploy();