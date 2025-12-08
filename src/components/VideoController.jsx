import React, { useState, useEffect, useRef } from 'react';
import './VideoController.css';

const VideoController = ({ currentEmotion }) => {
    const [activeSource, setActiveSource] = useState(`/videos/idle.mp4`);
    const [nextSource, setNextSource] = useState(null);
    const [isCrossfading, setIsCrossfading] = useState(false);

    // We use two video refs to handle the crossfade
    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);

    // Track which ref is currently "active" (visible)
    const [activeRefIndex, setActiveRefIndex] = useState(1); // 1 or 2

    useEffect(() => {
        // Initial load or when emotion changes
        const newSource = `/videos/${currentEmotion}.mp4`;

        // If it's the very first load/active source is same, do nothing (handling initial state is tricky, simplified here)
        if (activeSource === newSource && !nextSource) return;

        // Start transition
        setNextSource(newSource);
        setIsCrossfading(true);

    }, [currentEmotion]);

    useEffect(() => {
        // Force mute on mount/update to satisfy mobile policies
        if (videoRef1.current) videoRef1.current.muted = true;
        if (videoRef2.current) videoRef2.current.muted = true;

        if (nextSource && isCrossfading) {
            // Logic:
            // Identify which video element is "next" (the invisible one)
            const nextVideoRef = activeRefIndex === 1 ? videoRef2 : videoRef1;

            // Load and play the next video
            if (nextVideoRef.current) {
                nextVideoRef.current.src = nextSource;
                nextVideoRef.current.load();

                // Ensure muted before playing
                nextVideoRef.current.muted = true;

                const playPromise = nextVideoRef.current.play();

                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Video is playing, trigger fade
                        // Actual fade is handled by CSS classes based on activeRefIndex state change
                        // But we wait for a brief moment to ensure it's rendering? 
                        // Actually, let's just swap the index now.
                        setActiveRefIndex(prev => prev === 1 ? 2 : 1);

                        // After transition completes, cleanup
                        setTimeout(() => {
                            setIsCrossfading(false);
                            setActiveSource(nextSource);
                            setNextSource(null);
                        }, 2500); // Matches CSS transition duration
                    }).catch(error => {
                        console.error("Auto-play prevented:", error);
                    });
                }
            }
        }
    }, [nextSource, isCrossfading]);


    return (
        <div className="video-container">
            {/* Video 1 */}
            <video
                ref={videoRef1}
                className={`video-layer ${activeRefIndex === 1 ? 'visible' : 'hidden'}`}
                loop
                muted
                autoPlay
                playsInline
                // If it's active and no next source, it holds activeSource. 
                // If it's inactive and waiting, it stays put until assigned.
                // Initial state logic:
                src={activeRefIndex === 1 ? activeSource : undefined}
            />

            {/* Video 2 */}
            <video
                ref={videoRef2}
                className={`video-layer ${activeRefIndex === 2 ? 'visible' : 'hidden'}`}
                loop
                muted
                autoPlay
                playsInline
                src={activeRefIndex === 2 ? activeSource : undefined}
            />

            {/* Overlay to darken slightly for UI visibility? Optional. */}
            <div className="video-overlay" />
        </div>
    );
};

export default VideoController;
