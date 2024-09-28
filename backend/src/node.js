const Server = require('./server');
const Client = require('./client');
const FileManager = require('./fileManager');
const net = require('net');
const path = require('path');

class Node {
  constructor(port, dataDir) {
    this.port = port;
    this.dataDir = dataDir;
    this.fileManager = new FileManager(dataDir);
    this.server = new Server(port, this.fileManager);
    this.client = new Client(this.fileManager);
    this.peers = new Map(); // Use Map to store peer connections with their addresses
  }

  async start() {
    await this.fileManager.initialize();
    this.server.start();
    console.log(`Node started on port ${this.port}`);
  }

  async connectToPeer(host, port) {
    try {
      const socket = await this.client.connect(host, port);
      const peerAddress = `${host}:${port}`;
      this.peers.set(peerAddress, socket);

      console.log(`Connected to peer ${peerAddress}`);

      socket.on('close', () => {
        console.log(`Disconnected from peer ${peerAddress}`);
        this.peers.delete(peerAddress);
      });

      return socket;
    } catch (error) {
      console.error(`Failed to connect to peer ${host}:${port}:`, error.message);
    }
  }

  async downloadFile(fileName) {
    console.log(`Attempting to download file: ${fileName}`);
    const fileInfo = await this.getFileInfo(fileName);
    
    if (!fileInfo) {
      console.error(`File ${fileName} not found in the network`);
      return;
    }

    const totalChunks = fileInfo.totalChunks;
    const chunkPromises = [];

    for (let i = 0; i < totalChunks; i++) {
      chunkPromises.push(this.downloadChunk(fileName, i));
    }

    await Promise.all(chunkPromises);
    await this.fileManager.reassembleFile(fileName, totalChunks);
    console.log(`File ${fileName} downloaded successfully`);
  }

  async downloadChunk(fileName, chunkIndex) {
    for (const [peerAddress, socket] of this.peers) {
      try {
        const chunkData = await this.client.requestChunk(socket, fileName, chunkIndex);
        await this.fileManager.saveChunk(fileName, chunkIndex, chunkData);
        console.log(`Chunk ${chunkIndex} of ${fileName} downloaded from ${peerAddress}`);
        return;
      } catch (error) {
        console.error(`Failed to download chunk ${chunkIndex} from ${peerAddress}:`, error.message);
      }
    }
    throw new Error(`Failed to download chunk ${chunkIndex} from any peer`);
  }

  async uploadFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`Uploading file: ${fileName}`);

    const fileBuffer = await this.fileManager.readFile(filePath);
    const chunks = await this.fileManager.chunkFile(fileBuffer);

    for (const [index, chunkData] of Object.entries(chunks)) {
      await this.fileManager.saveChunk(fileName, parseInt(index), chunkData);
    }

    console.log(`File ${fileName} uploaded and ready for sharing`);
  }

  async getFileInfo(fileName) {
    for (const [peerAddress, socket] of this.peers) {
      try {
        const fileList = await this.client.requestFileList(socket);
        const fileInfo = fileList.find(file => file.fileName === fileName);
        if (fileInfo) {
          return fileInfo;
        }
      } catch (error) {
        console.error(`Failed to get file info from ${peerAddress}:`, error.message);
      }
    }
    return null;
  }

  async listAvailableFiles() {
    const localFiles = await this.fileManager.listAvailableFiles();
    const remoteFiles = new Set();

    for (const [peerAddress, socket] of this.peers) {
      try {
        const peerFiles = await this.client.requestFileList(socket);
        peerFiles.forEach(file => remoteFiles.add(file.fileName));
      } catch (error) {
        console.error(`Failed to get file list from ${peerAddress}:`, error.message);
      }
    }

    return [...new Set([...localFiles, ...remoteFiles])];
  }

  async deleteFile(fileName) {
    await this.fileManager.deleteFile(fileName);
    console.log(`File ${fileName} deleted from local storage`);
  }
}

module.exports = Node;
