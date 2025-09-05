import React, { useState } from 'react';

const helpQA = [
  { q: "What is KYC?", a: "KYC means Know Your Customer. It verifies your identity." },
  { q: "Why do I need KYC?", a: "KYC is needed for security and to use financial services." },
  { q: "Is my data safe?", a: "Yes, your data is encrypted and protected." }
];

function App() {
  const [step, setStep] = useState(0);
  const [kycData, setKycData] = useState({ name: '', documentType: '', documentNumber: '', faceImage: '', language: 'en', progress: 0 });
  const [offline, setOffline] = useState(!navigator.onLine);
  const [showHelp, setShowHelp] = useState(false);
  const [query, setQuery] = useState('');
  const [queryAnswer, setQueryAnswer] = useState('');

  // Voice prompt function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = kycData.language === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  // Voice input for queries
  const listen = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = kycData.language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.onresult = (event) => {
        setQuery(event.results[0][0].transcript);
      };
      recognition.start();
    } else {
      alert('Voice input not supported in this browser.');
    }
  };

  // Help Q&A search
  const handleQuery = () => {
    const found = helpQA.find(item => query.toLowerCase().includes(item.q.toLowerCase()));
    setQueryAnswer(found ? found.a : "Sorry, please ask another question.");
    speak(found ? found.a : "Sorry, please ask another question.");
  };

  // Step screens
  const screens = [
    // Splash screen
    <div>
      <h1>👋</h1>
      <button onClick={() => { setStep(1); speak('Welcome! Tap to start KYC.'); }}>Start KYC</button>
      <button onClick={() => setShowHelp(true)}>🆘 Help</button>
      <button onClick={() => setKycData({ ...kycData, language: kycData.language === 'en' ? 'hi' : 'en' })}>🌐 Change Language</button>
      {showHelp && (
        <div style={{ background: "#eee", padding: "1em", borderRadius: "8px" }}>
          <h3>Help & FAQ</h3>
          {helpQA.map((item, idx) => (
            <div key={idx}>
              <strong>{item.q}</strong>
              <div>{item.a}</div>
            </div>
          ))}
          <button onClick={() => setShowHelp(false)}>Close</button>
        </div>
      )}
    </div>,
    // KYC method selection with icons and voice explanation
    <div>
      <h2>Choose KYC Method</h2>
      <div style={{ display: "flex", gap: "2em", justifyContent: "center" }}>
        <div onClick={() => { setKycData({ ...kycData, documentType: 'Digilocker' }); setStep(2); speak('Digilocker selected.'); }} style={{ cursor: "pointer" }}>
          <img src={process.env.PUBLIC_URL + '/digilocker.png'} alt="Digilocker" width={64} /><br />Digilocker
        </div>
        <div onClick={() => { setKycData({ ...kycData, documentType: 'Aadhaar' }); setStep(3); speak('Aadhaar selected.'); }} style={{ cursor: "pointer" }}>
          <img src={process.env.PUBLIC_URL + '/aadhaar.png'} alt="Aadhaar" width={64} /><br />Aadhaar
        </div>
        <div onClick={() => { setKycData({ ...kycData, documentType: 'Face' }); setStep(4); speak('Face selected.'); }} style={{ cursor: "pointer" }}>
          <img src={process.env.PUBLIC_URL + '/face.png'} alt="Face" width={64} /><br />Face
        </div>
      </div>
      <button onClick={() => speak('Choose Digilocker, Aadhaar, or Face for KYC. Tap an icon to proceed.')}>🔊 Hear Explanation</button>
    </div>,
    // Digilocker document upload
    <div>
      <h2>Digilocker KYC</h2>
      <input type="file" accept="image/*,.pdf" onChange={e => {
        const file = e.target.files[0];
        if (file) {
          speak('Document uploaded. Proceed to next step.');
          setKycData({ ...kycData, documentNumber: file.name });
        }
      }} />
      <button onClick={() => setStep(7)}>Next</button>
    </div>,
    // Aadhaar entry with number pad and emojis, voice prompt
    <div>
      <h2>Aadhaar KYC</h2>
      <div>
        <input type="text" placeholder="Enter Aadhaar Number" value={kycData.documentNumber}
          onChange={e => setKycData({ ...kycData, documentNumber: e.target.value })} maxLength={12} style={{ fontSize: "2em", letterSpacing: "0.5em" }} />
        <div>
          {[1,2,3,4,5,6,7,8,9,0].map(n => (
            <button key={n} style={{ fontSize: "2em", margin: "0.2em" }} onClick={() => setKycData({ ...kycData, documentNumber: kycData.documentNumber + n })}>{n}</button>
          ))}
        </div>
        <div>
          <span role="img" aria-label="smile">😊</span>
          <span role="img" aria-label="thumbs up">👍</span>
        </div>
        <button onClick={() => speak('Please enter your Aadhaar number using the keypad.')}>🔊 Hear Instructions</button>
      </div>
      <button onClick={() => setStep(7)}>Next</button>
    </div>,
    // Face recognition placeholder
    <div>
      <h2>Face KYC</h2>
      <div>
        <img src={process.env.PUBLIC_URL + '/face-outline.png'} alt="Face Outline" width={128} />
        <button onClick={() => speak('Align your face in the outline and tap capture.')}>🔊 Hear Instructions</button>
        <button onClick={() => {
          // Placeholder for face capture
          setKycData({ ...kycData, faceImage: 'captured' });
          speak('Face captured!');
          setStep(7);
        }}>Capture</button>
      </div>
    </div>,
    // Completion tab
    <div>
      <h2>✅ KYC Verification Complete!</h2>
      <div>Congratulations! Your KYC process is finished.</div>
      <button onClick={() => setStep(6)}>Next</button>
    </div>,
    // Offline notification
    <div>
      <h2>Offline Notification</h2>
      <div>
        {offline ? "You are offline. Images and data will be saved locally and uploaded when online." : "You are online. Data will be uploaded."}
      </div>
      <button onClick={() => setStep(8)}>Next</button>
    </div>,
    // Query page (keyboard/voice input)
    <div>
      <h2>Ask a Question</h2>
      <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Type your question..." />
      <button onClick={listen}>🎤 Voice Input</button>
      <button onClick={handleQuery}>Ask</button>
      {queryAnswer && <div style={{ marginTop: "1em", background: "#eee", padding: "1em", borderRadius: "8px" }}>{queryAnswer}</div>}
      <button onClick={() => setStep(0)}>Restart</button>
    </div>
  ];

  // Offline/online event listeners
  React.useEffect(() => {
    window.addEventListener('online', () => setOffline(false));
    window.addEventListener('offline', () => setOffline(true));
  }, []);

  return (
    <div>
      <div>{offline ? <span>🔴 Offline Mode</span> : <span>🟢 Online</span>}</div>
      <div>{screens[step]}</div>
      <div>
        <progress value={step} max={8}></progress>
      </div>
    </div>
  );
}

export default App;