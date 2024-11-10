import React, { useState } from 'react';
import ReactDOM from 'react-dom/client'
import "./debugging.css";
import { SebFile } from './seb-tools';
import { Helmet } from 'react-helmet';

const App = () => {

  const [url, setUrl] = useState<string>('');
  const [hash, setHash] = useState<string>('');
  const [configHash, setConfigHash] = useState<string>('');
  const [sebFile, setSebFile] = useState<SebFile | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (text && typeof text === 'string') {
          const sebFileInstance = await SebFile.createInstance(text);

          if (!sebFileInstance) {
            alert('Error parsing SEB file');
            return;
          }
          setConfigHash(sebFileInstance.ConfigHash);

          setSebFile(sebFileInstance);
          setUrl(sebFileInstance.StartUrl ? sebFileInstance.StartUrl : "");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUrlSubmit = () => {
    if (sebFile && url) {
      const configKey = sebFile.getConfigKey(url);
      setHash(configKey);
    }
  };

  return (
    <div>
      <Helmet>
        <title>SEB file debugging</title>
      </Helmet>
      <h1>SEB file debugging</h1>
      <input
        type="file"
        accept=".xml,.seb"
        onChange={handleFileChange}
      />
      <br />
      <h2>JSON Output</h2>
      <textarea
        rows={10}
        cols={50}
        value={sebFile?.SerializedJson}
        readOnly
        placeholder="JSON output will appear here"
      ></textarea>
      <br />
      <h3>Config Hash</h3>
      <textarea
        rows={1}
        cols={50}
        value={configHash}
        readOnly
        placeholder="Hash output will appear here"
      ></textarea>
      <br />
      <h2>Get Config Key</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <br />

      <button onClick={handleUrlSubmit}>Get Hash</button>

      <h3>Config Key for {url}</h3>
      <textarea
        rows={1}
        cols={50}
        value={hash}
        readOnly
        placeholder="Hash output will appear here"
      ></textarea>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
