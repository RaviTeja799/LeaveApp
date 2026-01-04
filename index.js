import 'dotenv/config';
import { v1 as uuidv1 } from "uuid";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import fs from 'fs';

async function main() {
  try {
    console.log("Azure Blob storage v12 - Uploading Voice Note");
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) throw Error('Azure Storage accountName not found');

    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
    const containerName = 'leave-voice-notes';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Check if container exists, create if not
    const exists = await containerClient.exists();
    if (!exists) {
      console.log(`\nCreating container: ${containerName}`);
      await containerClient.create();
    }
    const facultyId = 'faculty-12345'; // Example faculty ID
    const applicationId = uuidv1();
    const blobName = `${facultyId}/${applicationId}.m4a`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const filePath = "message.m4a"; // Sample local file path
    const data = fs.readFileSync(filePath);
    console.log(`\nUploading to Azure storage...\n\tPath: ${blobName}`);
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(`Upload successful. RequestId: ${uploadBlobResponse.requestId}`);
    // This is the URL you will save to Supabase
    console.log(`\nFile URL for Supabase voice_blob_name: ${blockBlobClient.url}`);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => console.log("Done"))
  .catch((ex) => console.error(ex.message));