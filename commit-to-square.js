import { SquareCloudAPI } from "@squarecloud/api";
import { join } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const token = process.env.SQUARE_API_KEY;
const api_id = process.env.API_ID_KEY;
const api = new SquareCloudAPI(token);
const app = await api.applications.get("8075952c25f74e918cc365966da4e6d4");
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fileName = "app.zip";
const filePath = join(__dirname, fileName);
const restart = true;
// Perform the upload operation
const success = await app.commit(filePath, fileName, restart);

// Handle the result accordingly
if (success) {
  console.log(`Application uploaded successfully.`, success);
} else {
  console.error(`Failed to upload application.`);
}
