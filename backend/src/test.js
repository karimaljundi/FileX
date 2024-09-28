const Node = require('./node');
const fs = require('fs').promises;
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  // Create 4 nodes
  const node1 = new Node(3000, './data/node1');
  const node2 = new Node(3001, './data/node2');
  const node3 = new Node(3002, './data/node3');
  const node4 = new Node(3003, './data/node4');

  // Start all nodes
  await node1.start();
  await node2.start();
  await node3.start();
  await node4.start();

  // Connect nodes to each other
  await node2.connectToPeer('localhost', 3000);
  await node3.connectToPeer('localhost', 3000);
  await node4.connectToPeer('localhost', 3000);

  // Upload a test file to node1
  const testFilePath = path.join(__dirname, 'test_file.txt');
  await node1.uploadFile(testFilePath);

  // Wait a bit for the upload to complete
  await sleep(1000);

  // List available files on node1
  console.log('Files available on node1:');
  console.log(await node1.listAvailableFiles());

  // Download the file from node4
  await node4.downloadFile('test_file.txt');

  // Verify file integrity
  const originalContent = await fs.readFile(testFilePath, 'utf-8');
  const downloadedContent = await fs.readFile(path.join('./data/node4', 'test_file.txt'), 'utf-8');

  if (originalContent === downloadedContent) {
    console.log('File transfer successful! Contents match.');
  } else {
    console.log('File transfer failed. Contents do not match.');
  }

  // Clean up
  process.exit(0);
}

runTest().catch(console.error);
