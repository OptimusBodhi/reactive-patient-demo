import React from 'react';
import './ControlPanel.css';

const emotions = [
    { id: 'neutral', label: 'Neutral', icon: '😐' },
    { id: 'happy', label: 'Happy', icon: '😊' },
    { id: 'sad', label: 'Sad', icon: '😔' },
    { id: 'angry', label: 'Angry', icon: '😠' },
    { id: 'anxious', label: 'Anxious', icon: '😰' },
];

const ControlPanel = ({ currentEmotion, onEmotionChange }) => {
    return (
        <div className="control-panel-container">
            <div className="glass-panel control-bar">
                {emotions.map((emotion) => (
                    <button
                        key={emotion.id}
                        className={`emotion-btn ${currentEmotion === emotion.id ? 'active' : ''}`}
                        onClick={() => onEmotionChange(emotion.id)}
                        aria-label={`Set emotional state to ${emotion.label}`}
                    >
                        <span className="emotion-icon">{emotion.icon}</span>
                        <span className="emotion-label">{emotion.label}</span>
                        {currentEmotion === emotion.id && <div className="active-glow" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ControlPanel;
