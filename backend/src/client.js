const net = require('net');

class Client {
  constructor(fileManager) {
    this.fileManager = fileManager;
  }

  connect(host, port) {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      socket.connect(port, host, () => {
        console.log(`Connected to ${host}:${port}`);
        resolve(socket);
      });

      socket.on('error', (error) => {
        reject(error);
      });
    });
  }

  async requestChunk(socket, fileName, chunkIndex) {
    return new Promise((resolve, reject) => {
      socket.write(JSON.stringify({
        type: 'REQUEST_CHUNK',
        fileName: fileName,
        chunkIndex: chunkIndex
      }));

      socket.once('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.type === 'CHUNK_DATA') {
          const chunkData = Buffer.from(response.data, 'base64');
          this.fileManager.saveChunk(fileName, chunkIndex, chunkData);
          resolve(chunkData);
        } else {
          reject(new Error('Unexpected response type'));
        }
      });
    });
  }

  async requestFileList(socket) {
    return new Promise((resolve, reject) => {
      socket.write(JSON.stringify({
        type: 'REQUEST_FILE_LIST'
      }));

      socket.once('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.type === 'FILE_LIST') {
          resolve(response.files);
        } else {
          reject(new Error('Unexpected response type'));
        }
      });
    });
  }
}

module.exports = Client;
