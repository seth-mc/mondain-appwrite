import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, FastForward, Music } from 'lucide-react';
import useClickOutside from '@/hooks/useClickOutside';

declare global {
    interface Window {
        SC: any;
    }
}

interface State {
    playertitle: string;
    playButtonState: string;
    record: string;
    duration: number;
    currentPosition: number;
    playlistimg: string;
    playlistlink: string;
    isWidgetReady: boolean;
    isLoading: boolean;
}

interface PlayerComponentProps {
    isOpen?: boolean;
    onToggle?: () => void;
    onClose?: () => void;
    darkMode?: boolean;
}

const PlayerComponent: React.FC<PlayerComponentProps> = ({ 
    isOpen = false, 
    onToggle, 
    onClose,
    darkMode = false 
}) => {
    const [state, setState] = useState<State>({
        playertitle: "Loading...",
        playButtonState: "player__button__play",
        record: "record d",
        duration: 0,
        currentPosition: 0,
        playlistimg: "https://i1.sndcdn.com/artworks-JH2uC966LI0mbntK-yaC4bw-t500x500.jpg",
        playlistlink: "https://soundcloud.com/mondain-357657441/mondain-mix-01",
        isWidgetReady: false,
        isLoading: true,
    });

    const widgetRef = useRef<any>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Click outside detection
    const playerRef = useClickOutside<HTMLDivElement>(() => {
        if (isOpen && onClose) {
            onClose();
        }
    });

    // Calculate player width based on isOpen prop
    const playerwidth = isOpen ? "300px" : "0px";

    // Icon styling based on dark mode
    const iconClass = darkMode ? 'invert' : '';

    const loadSoundCloudAPI = useCallback(() => {
        return new Promise<void>((resolve) => {
            if (window.SC) {
                console.log("SoundCloud API already loaded");
                resolve();
            } else {
                const script = document.createElement("script");
                script.src = "https://w.soundcloud.com/player/api.js";
                script.async = true;
                script.onload = () => {
                    console.log("SoundCloud API loaded");
                    resolve();
                };
                document.body.appendChild(script);
            }
        });
    }, []);

    const initializeWidget = useCallback(() => {
        if (!iframeRef.current || !window.SC) {
            console.log("iframe or SC not found");
            return false;
        }

        console.log("Initializing widget");
        widgetRef.current = window.SC.Widget(iframeRef.current);
        widgetRef.current.bind(window.SC.Widget.Events.READY, onWidgetReady);
        return true;
    }, []);

    const onWidgetReady = useCallback(() => {
        console.log("Widget ready");
        setState(prev => ({ ...prev, isWidgetReady: true, isLoading: false }));
        setupPlayerBindings();
        setupProgressUpdates();
    }, []);

    const setupPlayerBindings = useCallback(() => {
        if (!widgetRef.current) return;

        widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
            setState(prev => ({ ...prev, playButtonState: "player__button__pause", record: "record rotate d" }));
        });

        widgetRef.current.bind(window.SC.Widget.Events.PAUSE, () => {
            setState(prev => ({ ...prev, playButtonState: "player__button__play", record: "record rotate paused d" }));
        });

        widgetRef.current.bind(window.SC.Widget.Events.FINISH, () => {
            widgetRef.current.seekTo(0);
            widgetRef.current.play();
        });
    }, []);

    const setupProgressUpdates = useCallback(() => {
        if (!widgetRef.current) return;

        const updateProgress = () => {
            widgetRef.current.getPosition((position: number) => {
                setState(prev => ({ ...prev, currentPosition: position / 1000 }));
            });
            widgetRef.current.getDuration((duration: number) => {
                setState(prev => ({ ...prev, duration: duration / 1000 }));
            });
            widgetRef.current.getCurrentSound((sound: any) => {
                if (sound) {
                    setState(prev => ({ ...prev, playertitle: sound.title }));
                }
            });
        };

        updateProgress();
        const intervalId = setInterval(updateProgress, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const initializePlayer = async () => {
            await loadSoundCloudAPI();
            let retries = 0;
            const maxRetries = 5;
            const retryInterval = 1000; // 1 second

            const tryInitialize = () => {
                if (initializeWidget()) {
                    console.log("Widget initialized successfully");
                } else {
                    retries++;
                    if (retries < maxRetries) {
                        console.log(`Retrying initialization (${retries}/${maxRetries})`);
                        setTimeout(tryInitialize, retryInterval);
                    } else {
                        console.error("Failed to initialize widget after max retries");
                        setState(prev => ({ ...prev, isLoading: false, playertitle: "Failed to load player" }));
                    }
                }
            };

            tryInitialize();
        };

        initializePlayer();

        return () => {
            if (widgetRef.current) {
                widgetRef.current.unbind(window.SC.Widget.Events.READY);
                widgetRef.current.unbind(window.SC.Widget.Events.PLAY);
                widgetRef.current.unbind(window.SC.Widget.Events.PAUSE);
                widgetRef.current.unbind(window.SC.Widget.Events.FINISH);
            }
        };
    }, [loadSoundCloudAPI, initializeWidget]);

    const setPlayButton = () => {
        if (widgetRef.current && state.isWidgetReady) {
            widgetRef.current.toggle();
        }
    };

    const nextSong = () => {
        if (widgetRef.current && state.isWidgetReady) {
            widgetRef.current.next();
        }
    };

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!widgetRef.current || !state.isWidgetReady) return;

        const progressBar = e.currentTarget;
        const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
        const seekPosition = (clickPosition / progressBar.offsetWidth) * state.duration;
        widgetRef.current.seekTo(seekPosition * 1000);
    };

    const progress = (state.currentPosition / state.duration) * 100 || 0;

    return (
        <div ref={playerRef} id="mySidenav" style={{ width: playerwidth }} className="sidenav">
            <div id="playermenu" style={{ right: playerwidth }} onClick={handleToggle}>
                <div className="drag-header">
                <Music className="my-music-icon"/>
                </div>
            </div>
            <div className="player-container">
                <div className="player">
                    <div className="player-info">
                        <div className="player-title-outer">
                            <div className={`player-title ${state.playertitle.length > 15 ? 'player-title-marquee' : ''}`}>
                                {state.playertitle}
                            </div>
                        </div>
                        <div className="player-time">
                            <div className="current">{formatTime(state.currentPosition)}</div>
                            <div className="duration">{formatTime(state.duration)}</div>
                        </div>
                        <div className="progress-bar-container" onClick={handleSeek}>
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                       
                        <div className="player-controls mt-2">
                            <div className="text-secondary player-button" onClick={setPlayButton}>
                                {state.playButtonState === "player__button__play" ? 
                                    <Play className={iconClass} /> : 
                                    <Pause className={iconClass} />
                                }
                            </div>
                            <div className="text-secondary player-button ml-5" onClick={nextSong}>
                                <FastForward size={24} className={`max-w-fit ${iconClass}`} />
                            </div>
                        </div>
                    </div>
                    <div className="player-visual">
                        <div className="record-box">
                            <a href={state.playlistlink} target="_blank" rel="noreferrer">
                                <img alt="record" className={state.record} src={state.playlistimg} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <iframe
                ref={iframeRef}
                className="sc-widget"
                src={`https://w.soundcloud.com/player/?url=${state.playlistlink}`}
                allow="autoplay"
                style={{ display: 'none' }}
            ></iframe>
        </div>
    );
};

export default PlayerComponent;