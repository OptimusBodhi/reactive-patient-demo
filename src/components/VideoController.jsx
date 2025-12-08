import React, { useState, useEffect, useRef } from 'react';
import './VideoController.css';

const VideoController = ({ currentEmotion }) => {
    // Independent source states for the two layers
    const [src1, setSrc1] = useState(`/videos/idle.mp4`);
    const [src2, setSrc2] = useState(null);

    // Track which video is currently verified as "active" (visible)
    const [activeRefIndex, setActiveRefIndex] = useState(1);

    // Internal state to block rapid switching
    const [isTransitioning, setIsTransitioning] = useState(false);

    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);

    useEffect(() => {
        // When emotion changes, decide where to load the new video
        if (isTransitioning) return;

        const newSource = `/videos/${currentEmotion}.mp4`;

        // Don't transition to the same source
        const currentActiveSrc = activeRefIndex === 1 ? src1 : src2;
        if (newSource === currentActiveSrc) return;

        // Start transition logic
        setIsTransitioning(true);

        const targetIndex = activeRefIndex === 1 ? 2 : 1;
        const targetRef = activeRefIndex === 1 ? videoRef2 : videoRef1;
        const setTargetSrc = activeRefIndex === 1 ? setSrc2 : setSrc1;

        // 1. Set the source for the hidden layer
        setTargetSrc(newSource);

        // 2. Wait slightly for prop propagation / DOM update
        setTimeout(() => {
            if (targetRef.current) {
                targetRef.current.load();
                targetRef.current.muted = true;

                targetRef.current.play().then(() => {
                    // 3. Once playing, flip the visibility
                    setActiveRefIndex(targetIndex);

                    // 4. Persistence cleanup:
                    // We DO NOT unset the old source immediately. 
                    // We wait for the fade to complete (2.5s) AND then we unlock.
                    // The old video keeps playing underneath until opacity is 0.
                    setTimeout(() => {
                        setIsTransitioning(false);
                    }, 2500);

                }).catch(err => {
                    console.error("Play failed", err);
                    setIsTransitioning(false);
                });
            }
        }, 50);

    }, [currentEmotion]);

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
                loop
                muted
                autoPlay
                playsInline
                src={src1 || undefined}
            />
            <video
                ref={videoRef2}
                className={`video-layer ${activeRefIndex === 2 ? 'visible' : 'hidden'}`}
                loop
                muted
                autoPlay
                playsInline
                src={src2 || undefined}
            />
            <div className="video-overlay" />
        </div>
    );
};

export default VideoController;
