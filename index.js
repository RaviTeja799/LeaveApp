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
    // Get a reference to a container
    const containerName = 'voicemessages';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!containerName) {
      // Create the container
      console.log('\nCreating container...');
      console.log('\t', containerName);
      const createContainerResponse = await containerClient.create();
      console.log(
        `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
      );
    }
    else {
      console.log(`Using existing container: ${containerName}`);
    }
    // Get a block blob client
    const blobName = 'quickstart' + uuidv1() + '.txt';
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    // Display blob name and url
    console.log(
      `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
    );
    // Upload data to the blob
    const data = 'Hello, World!';
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(
      `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
    );
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    console.log('\nDownloaded blob content...');
    console.log(
      '\t',
      await streamToText(downloadBlockBlobResponse.readableStreamBody)
    );
    // Delete container
    console.log('\nDeleting container...');

    const deleteContainerResponse = await containerClient.delete();
    console.log(
      'Container was deleted successfully. requestId: ',
      deleteContainerResponse.requestId
    );
  } catch (error) {
    console.error("Error uploading blob:", error.message);
  }
}

main()
  .then(() => console.log("Done"))
  .catch((ex) => console.error(ex.message));

// Convert stream to text
async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}