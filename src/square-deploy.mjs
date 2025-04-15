import { SquareCloudAPI } from "@squarecloud/api";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Verificação de variáveis de ambiente
if (!process.env.SQUARE_API_KEY || !process.env.API_ID_KEY) {
  throw new Error("Missing required environment variables");
}

const token = process.env.SQUARE_API_KEY;
const api_id = process.env.API_ID_KEY;
const api = new SquareCloudAPI(token);

async function deploy() {
  try {
    const app = await api.applications.get(api_id);
    console.log('Stopping application...');
    const stopped = await app.stop();
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const fileName = "app.zip";
    const filePath = join(__dirname, fileName);

    if (stopped) {
      console.log('Application stopped, uploading new version...');
      const success = await app.commit(filePath, fileName);

      if (success) {
        console.log('Upload successful, starting application...');
        const started = await app.start();
        console.log(`Application started successfully: ${started}`);
        return { success: true, started };
      } else {
        throw new Error('Failed to upload application');
      }
    } else {
      throw new Error('Failed to stop application');
    }
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();