import { SquareCloudAPI } from "@squarecloud/api";
import { join } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const token = process.env.SQUARE_API_KEY;
const api_id = process.env.API_ID_KEY;
console.log(token, api_id)
const api = new SquareCloudAPI("24de303b047c1b32d2c1fcec42ed0e1bc6fe74f3-4e3da8a6b5aeb8f83af1ae318c232888f7286fef7e6c71696c63b5d9fe4ad2b0");
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
