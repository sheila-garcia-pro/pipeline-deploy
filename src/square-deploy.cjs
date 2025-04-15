// square-deploy.js (CommonJS)
const { SquareCloudAPI } = require('@squarecloud/api');
const path = require('path');

async function deploy() {
  try {
    const token = process.env.SQUARE_API_KEY;
    const api_id = process.env.API_ID_KEY;
    
    const api = new SquareCloudAPI(token);
    const app = await api.applications.get(api_id);
    
    console.log('Parando aplicação...');
    const stopped = await app.stop();
    
    const filePath = path.join(__dirname, 'app.zip');
    
    if (stopped) {
      console.log('Realizando upload...');
      const success = await app.commit(filePath, 'app.zip');
      
      if (success) {
        console.log('Iniciando aplicação...');
        const started = await app.start();
        console.log('✅ Deploy concluído com sucesso!');
        process.exit(0);
      }
      throw new Error('Upload falhou');
    }
    throw new Error('Aplicação não parou corretamente');
  } catch (error) {
    console.error('❌ Erro no deploy:', error.message);
    process.exit(1);
  }
}

deploy();
