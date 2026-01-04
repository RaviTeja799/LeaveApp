// 1. Move dotenv to the top using import syntax
import 'dotenv/config'; 

// 2. Your other imports
import { v1 as uuidv1 } from "uuid";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

async function main() {
  try {
    console.log("Azure Blob storage v12 - JavaScript quickstart sample");

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) throw Error('Azure Storage accountName not found');

    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );

    console.log(`Connected to storage account: ${accountName}`);

    // Example: Create a unique name for the container
    const containerName = 'quickstart' + uuidv1();
    console.log(`Creating container: ${containerName}`);

    // Add more logic here...

  } catch (err) {
    // Note: use console.error instead of console.err
    console.error(`Error: ${err.message}`);
  }
}

main()
  .then(() => console.log("Done"))
  .catch((ex) => console.error(ex.message));