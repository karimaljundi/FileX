const net = require('net');
const FileManager = require('./fileManager');

class Server {
  constructor(port, fileManager) {
    this.port = port;
    this.fileManager = fileManager;
  }

  start() {
    const server = net.createServer((socket) => {
      console.log('Client connected');

      socket.on('data', async (data) => {
        const message = JSON.parse(data.toString());
        await this.handleMessage(socket, message);
      });

      socket.on('end', () => {
        console.log('Client disconnected');
      });
    });

    server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }

  async handleMessage(socket, message) {
    switch (message.type) {
      case 'REQUEST_CHUNK':
        const chunkData = await this.fileManager.getChunk(message.fileName, message.chunkIndex);
        socket.write(JSON.stringify({
          type: 'CHUNK_DATA',
          fileName: message.fileName,
          chunkIndex: message.chunkIndex,
          data: chunkData.toString('base64')
        }));
        break;
      case 'REQUEST_FILE_LIST':
        const files = await this.fileManager.listAvailableFiles();
        socket.write(JSON.stringify({
          type: 'FILE_LIST',
          files: files
        }));
        break;
      // Add more message types as needed
    }
  }
}

module.exports = Server;
