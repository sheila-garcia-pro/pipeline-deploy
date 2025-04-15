import { SquareCloudAPI } from "@squarecloud/api";
import { join } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as core from '@actions/core';

async function run() {
  try {
    const token = process.env.TOKEN_SQUARE_CLOUD;
    const api_id = process.env.API_ID;
    const zipFileName = core.getInput('zip_file_name', { required: true });
    const restartInput = core.getInput('restart_app');
    const restart = restartInput.toLowerCase() === 'true';

    console.log(`Square API Key: ${token.substring(0, 5)}...${token.slice(-5)}`);
    console.log(`API ID: ${api_id}`);
    console.log(`ZIP File Name: ${zipFileName}`);
    console.log(`Restart After Upload: ${restart}`);

    const api = new SquareCloudAPI(token);
    const app = await api.applications.get(api_id);

    if (!app) {
      core.setFailed(`Application with ID ${api_id} not found on SquareCloud.`);
      return;
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = join(__dirname, zipFileName);

    console.log(`Attempting to upload from path: ${filePath}`);

    const success = await app.commit(filePath, zipFileName, restart);

    if (success) {
      core.info(`Application "${app.name}" uploaded successfully.`);
    } else {
      core.setFailed(`Failed to upload application "${app.name}".`);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();