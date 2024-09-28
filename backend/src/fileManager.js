const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileManager {
  // constructor(dataDir = './data') {
  //   this.dataDir = dataDir;
  //   this.chunkSize = 512; // byte size (wtf lol)
  // }

  // async initialize() {
  //   try {ca
  //     await fs.mkdir(this.dataDir, { recursive: true });
  //   } catch (error) {
  //     console.error('Error creating data directory:', error);
  //   }
  // }

  async chunkFile(buffer) {
    // TODO: Implement file chunking
    // {1: "", 2: "", 3: "", 4:""};

  }


  async reassembleFile(fileName, totalChunks) {
    // TODO: Implement file reassembly

  }
  
  
  async saveChunk(fileName, chunkIndex, chunkData) {
    // TODO: Implement chunk saving

  }

  async getChunk(fileName, chunkIndex) {
    // TODO: Implement chunk retrieval

  }

  async listAvailableFiles() {
    // TODO: Implement file listing

  }

  async getFileInfo(fileName) {
    const filePath = path.join(this.dataDir, fileName);
    const chunks = await fs.readdir(filePath);
    const totalChunks = chunks.length;
    const fileSize = totalChunks * this.chunkSize;

    return {
      fileName,
      totalChunks,
      fileSize,
    };
  }

  async deleteFile(fileName) {
    const filePath = path.join(this.dataDir, fileName);
    await fs.rm(filePath, { recursive: true, force: true });
  }

  _generateChunkHash(chunkData) {
    // Helper function to generate a hash for a chunk
    return crypto.createHash('sha256').update(chunkData).digest('hex');
  }
}

module.exports = FileManager;
