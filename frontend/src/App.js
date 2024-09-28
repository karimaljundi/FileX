import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="upload-section">
          <div className="upload-container">
            <input
              type="file"
              id="file-upload"
              className="file-input"
              accept=".txt,.pdf,.doc,.docx"
            />
          </div>
         
        </div>
      </header>
    </div>
  );
}

export default App;
