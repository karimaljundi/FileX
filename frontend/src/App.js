import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import FileUploaded from './FileUploaded';  // Import the FileUploaded component
import './App.css';

function App() {
  const [uploadedFileName, setUploadedFileName] = useState(null);

  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <HomePage setUploadedFileName={setUploadedFileName} />} />
        <Route path="/file-uploaded" render={() => <FileUploaded fileName={uploadedFileName} />} />
      </Switch>
    </Router>
  );
}

function HomePage({ setUploadedFileName }) {
  const history = useHistory();
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (file) {
      setUploadedFileName(file.name);
      history.push('/file-uploaded');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">File X</h1>
        <div className="upload-section">
          <form onSubmit={handleSubmit}>
            <div className="upload-container">
              <label htmlFor="file-upload" className="custom-file-upload">
                Choose File
              </label>
              <input
                type="file"
                id="file-upload"
                className="file-input"
                accept=".txt"
                onChange={handleFileChange}
              />
            </div>
            <button type="submit" disabled={!file}>
              Upload
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
