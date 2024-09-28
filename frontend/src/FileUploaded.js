import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function FileUploaded({ fileName }) {
  const [downloads, setDownloads] = useState(() => {
    const saved = localStorage.getItem('downloads');
    return saved ? JSON.parse(saved) : [];
  });
  const history = useHistory();

  useEffect(() => {
    if (fileName && !downloads.includes(fileName)) {
      const newDownloads = [...downloads, fileName];
      setDownloads(newDownloads);
      localStorage.setItem('downloads', JSON.stringify(newDownloads));
    }
  }, [fileName, downloads]);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">File Uploaded</h1>
        <p>Your file "{fileName}" has been uploaded successfully!</p>
        <h2>Downloads List</h2>
        <ul>
          {downloads.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
        <button onClick={() => history.push('/')}>Upload Another File</button>
      </header>
    </div>
  );
}

export default FileUploaded;