const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileManager {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.chunkSize = 512; // 512 bytes (zzz)
  }

  async initialize() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  async chunkFile(buffer) {
    const chunks = {};
    let chunkIndex = 0;
    for (let i = 0; i < buffer.length; i += this.chunkSize) {
      const chunk = buffer.slice(i, i + this.chunkSize);
      chunks[chunkIndex] = chunk;
      chunkIndex++;
    }
    return chunks;
  }

  async reassembleFile(fileName, totalChunks) {
    const filePath = path.join(this.dataDir, fileName);
    const reassembledBuffer = Buffer.alloc(totalChunks * this.chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkData = await this.getChunk(fileName, i);
      chunkData.copy(reassembledBuffer, i * this.chunkSize);
    }

    await fs.writeFile(filePath, reassembledBuffer);
    console.log(`File ${fileName} reassembled successfully`);
  }

  async saveChunk(fileName, chunkIndex, chunkData) {
    const filePath = path.join(this.dataDir, fileName);
    await fs.mkdir(filePath, { recursive: true });
    const chunkPath = path.join(filePath, `chunk_${chunkIndex}`);
    await fs.writeFile(chunkPath, chunkData);
  }

  async getChunk(fileName, chunkIndex) {
    const filePath = path.join(this.dataDir, fileName);
    const chunkPath = path.join(filePath, `chunk_${chunkIndex}`);
    return await fs.readFile(chunkPath);
  }

  async listAvailableFiles() {
    const files = await fs.readdir(this.dataDir);
    const fileInfoPromises = files.map(async (fileName) => {
      const filePath = path.join(this.dataDir, fileName);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        const chunks = await fs.readdir(filePath);
        const totalChunks = chunks.length;
        const fileSize = totalChunks * this.chunkSize;
        return { fileName, totalChunks, fileSize };
      }
      return null;
    });
    const fileInfos = await Promise.all(fileInfoPromises);
    return fileInfos.filter(info => info !== null);
  }

  async getFileInfo(fileName) {
    const filePath = path.join(this.dataDir, fileName);
    try {
      const chunks = await fs.readdir(filePath);
      const totalChunks = chunks.length;
      const fileSize = totalChunks * this.chunkSize;
      return { fileName, totalChunks, fileSize };
    } catch (error) {
      console.error(`Error getting file info for ${fileName}:`, error);
      return null;
    }
  }

  async deleteFile(fileName) {
    const filePath = path.join(this.dataDir, fileName);
    await fs.rm(filePath, { recursive: true, force: true });
  }

  async readFile(filePath) {
    return await fs.readFile(filePath);
  }

  _generateChunkHash(chunkData) {
    return crypto.createHash('sha256').update(chunkData).digest('hex');
  }

  async verifyFileIntegrity(fileName) {
    const fileInfo = await this.getFileInfo(fileName);
    // error handling
    if (!fileInfo) {
      throw new Error(`File ${fileName} not found`);
    }

    const originalFile = await this.readFile(path.join(this.dataDir, fileName));
    const reassembledFile = Buffer.alloc(fileInfo.fileSize);

    for (let i = 0; i < fileInfo.totalChunks; i++) {
      const chunkData = await this.getChunk(fileName, i);
      chunkData.copy(reassembledFile, i * this.chunkSize);
    }

    const originalHash = this._generateChunkHash(originalFile);
    const reassembledHash = this._generateChunkHash(reassembledFile);

    return originalHash === reassembledHash;
  }
}

module.exports = FileManager;
