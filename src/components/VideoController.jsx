import React, { useState, useEffect, useRef } from 'react';
import './VideoController.css';

const VideoController = ({ currentEmotion }) => {
    // Independent source states
    const [src1, setSrc1] = useState(`/videos/idle.mp4`);
    const [src2, setSrc2] = useState(null);

    // Track which video is visible
    const [activeRefIndex, setActiveRefIndex] = useState(1);

    // Lock to prevent rapid switching
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Store the "desired" emotion until the current loop finishes
    const pendingEmotionRef = useRef(null);

    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);

    // 1. Listen for requests, but queue them instead of acting immediately
    useEffect(() => {
        // If it's the same as what's playing (or what's already pending), ignore
        // We need to check against the *current active real source*
        const currentActiveSrc = activeRefIndex === 1 ? src1 : src2;
        const newSource = `/videos/${currentEmotion}.mp4`;

        if (currentActiveSrc === newSource) {
            pendingEmotionRef.current = null;
            return;
        }

        // Queue it up
        pendingEmotionRef.current = newSource;
        console.log(`Queued transition to: ${currentEmotion}`);

    }, [currentEmotion, activeRefIndex, src1, src2]);


    // 2. The core transition function
    const executeTransition = (newSource) => {
        setIsTransitioning(true);

        const targetIndex = activeRefIndex === 1 ? 2 : 1;
        const targetRef = activeRefIndex === 1 ? videoRef2 : videoRef1;
        const currentRef = activeRefIndex === 1 ? videoRef1 : videoRef2;
        const setTargetSrc = activeRefIndex === 1 ? setSrc2 : setSrc1;

        // Set up the new video
        setTargetSrc(newSource);

        setTimeout(() => {
            if (targetRef.current && currentRef.current) {
                targetRef.current.load();
                targetRef.current.muted = true;

                // Play BOTH:
                // 1. The new one (starts at 0)
                // 2. The old one (restarts at 0 because handleVideoEnded just finished)
                // This ensures they run in sync during the crossfade.

                Promise.all([
                    targetRef.current.play(),
                    currentRef.current.play()
                ]).then(() => {
                    // Flip visibility to start crossfade
                    setActiveRefIndex(targetIndex);

                    // Cleanup after fade duration
                    setTimeout(() => {
                        setIsTransitioning(false);
                        // Optional: clear old source?
                    }, 2500);
                }).catch(err => {
                    console.error("Playback failed during transition", err);
                    setIsTransitioning(false);
                });
            }
        }, 50);
    };

    // 3. Handle End of Loop
    const handleVideoEnded = (e) => {
        const videoElement = e.target;

        // Is there a pending change?
        if (pendingEmotionRef.current && !isTransitioning) {
            const nextSrc = pendingEmotionRef.current;
            pendingEmotionRef.current = null; // Consume it
            executeTransition(nextSrc);
        } else {
            // No change needed, just loop manually
            videoElement.currentTime = 0;
            videoElement.play().catch(e => console.error("Loop restart failed", e));
        }
    };

    // Ensure mute on mount
    useEffect(() => {
        if (videoRef1.current) videoRef1.current.muted = true;
        if (videoRef2.current) videoRef2.current.muted = true;
    }, []);

    return (
        <div className="video-container">
            <video
                ref={videoRef1}
                className={`video-layer ${activeRefIndex === 1 ? 'visible' : 'hidden'}`}
                muted
                autoPlay
                playsInline
                src={src1 || undefined}
                onEnded={handleVideoEnded}
            />
            <video
                ref={videoRef2}
                className={`video-layer ${activeRefIndex === 2 ? 'visible' : 'hidden'}`}
                muted
                autoPlay
                playsInline
                src={src2 || undefined}
                onEnded={handleVideoEnded}
            />
            <div className="video-overlay" />
        </div>
    );
};

export default VideoController;
