import React, { useState } from 'react';
import VideoController from './components/VideoController';
import ControlPanel from './components/ControlPanel';
import './App.css';

function App() {
  const [currentEmotion, setCurrentEmotion] = useState('neutral');

  const handleEmotionChange = (emotionId) => {
    console.log(`Switching execution to: ${emotionId}`);
    setCurrentEmotion(emotionId);
  };

  return (
    <main className="app-main">
      <VideoController currentEmotion={currentEmotion} />

      <div className="ui-layer">
        <header className="app-header">
          <h1>Patient Simulator</h1>
          <p>Select an emotional state</p>
        </header>

        <ControlPanel
          currentEmotion={currentEmotion}
          onEmotionChange={handleEmotionChange}
        />
      </div>
    </main>
  );
}

export default App;
