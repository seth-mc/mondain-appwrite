/* eslint-disable @typescript-eslint/no-explicit-any */
import { Play, Pause, FastForward, Music } from 'lucide-react';
import React from 'react';

declare global {
    interface Window {
        SC: any;
    }
}

interface State {
    playertitle: string;
    time: string;
    playButtonState: string;
    button: string;
    playerOpen: boolean | string | null;
    playerwidth: string;
    record: string;
    duration: string,
    playlistimg: string;
    playlistlink: string;
    isWidgetReady: boolean;
}


export default class PlayerComponent extends React.Component<object, State> {
    wrapperRef: React.RefObject<HTMLDivElement>;
    widget: any;
    intervalId: NodeJS.Timeout | undefined;

    constructor(props: any) {
        super(props);

        this.state = {
            playertitle: "",
            time: "",
            playButtonState: "player__button__play",
            button: "PLAY",
            playerOpen: null,
            playerwidth: "0px",
            record: "record d",
            duration: "",
            playlistimg: "https://i2o.scdn.co/image/ab67706c0000cfa3de2510c5c5d4b17e565efaca",
            playlistlink: "https://open.spotify.com/playlist/5fm3smZtgJjATBcIN1fd2Q?si=32c3c0f241c446d0",
            isWidgetReady: false,
        };
        this.wrapperRef = React.createRef();
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.widget = React.createRef();
        this.nextSong = this.nextSong.bind(this);
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
        const script = document.createElement("script");
        script.src = "https://w.soundcloud.com/player/api.js";
        script.async = true;
        document.body.appendChild(script);

        const originalConsoleError = console.error;


        script.onload = () => {
            // Restore console.error
            console.error = originalConsoleError;

            const iframeElement = document.querySelector("iframe.sc-widget");
            if (!iframeElement) {
                console.error("No iframe with class 'sc-widget' found.");
                return;
            }
            this.widget = window.SC.Widget(iframeElement) as any;
            this.widget.bind(window.SC.Widget.Events.READY, () => {
                this.setState({ isWidgetReady: true }); // Set state to indicate widget is ready
                this.initPlayer();
            });
        };
    }

    initPlayer() {
        this.randomSong(this.widget);
        this.setupPlayerBindings();
        this.setupPeriodicUpdates();
    }

    randomSong(player: any) {
        const randomVal = Math.random() * 10;
        for (let i = 0; i < randomVal; i++) {
            player.next();
        }
    }

    setupPlayerBindings() {
        this.widget.getCurrentSound((song: any) => {
            this.setState({
                playertitle: song.title + ' - ' + song.artist,
                playButtonState: "player__button__play",
                record: "record rotate paused d",
            });
        });

        this.widget.bind(window.SC.Widget.Events.PLAY, () => {
            this.setState({ playButtonState: "player__button__pause", record: "record rotate d" });
        });

        this.widget.bind(window.SC.Widget.Events.PAUSE, () => {
            this.setState({ playButtonState: "player__button__play", record: "record rotate paused d" });
        });

        this.widget.bind(window.SC.Widget.Events.FINISH, () => {
            this.randomSong(this.widget);
        });
    }

    setupPeriodicUpdates() {
        this.intervalId = setInterval(() => {
            if (this.state.isWidgetReady) {
                try {
                    this.widget.getCurrentSound((song: any) => {
                        this.setState({ playertitle: song.title });
                    });
                    this.widget.getPosition((position: any) => {
                        this.setState({ time: this.formatTime(position / 1000) });
                    });
                } catch (error) {
                    //console.error("Error interacting with the widget:", error);
                }
            }
        }, 1000);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside);
        clearInterval(this.intervalId);
    }

    handleClickOutside(event: any) {
        if (this.wrapperRef) {
            if (this.wrapperRef.current) {
                if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
                    this.setState({
                        playerOpen: null,
                        playerwidth: "0px",
                    });
                }
            }
        }
    }

    setPlayButton() {
        if (this.widget) {
            this.widget.toggle();
        }
    }

    nextSong() {
        if (this.widget) {
            this.widget.next();
        }
    }

    setSidenavButton() {
        if (this.state.playerOpen === null) {
            this.setState({
                playerOpen: true,
                playerwidth: "300px",
            });
        } else if (this.state.playerOpen === true) {
            this.setState({
                playerOpen: null,
                playerwidth: "0px",
            });
        }
    }

    formatTime(time: any) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    render() {
        return (
            <div id="mySidenav" ref={this.wrapperRef} style={{ "width": this.state.playerwidth }} className="sidenav">
                <div id="playermenu" style={{ "right": this.state.playerwidth }} onClick={this.setSidenavButton.bind(this)}>
                    <div className="drag-header">
                        <Music />
                    </div>
                </div>
                <div className="player-container">
                    <div className="player">
                        <div className="player-info">
                            <div className="player-title-outer">
                                <div className={`player-title ${this.state.playertitle ? (this.state.playertitle.length > 15 ? 'player-title-marquee' : '') : ''}`}>
                                    {this.state.playertitle}
                                </div>
                            </div>
                            <div className="player-time">
                                <div className="current">{this.state.time}</div>
                                <div className="duration">{this.state.duration}</div>
                            </div>
                            <div className="player-controls mt-2">
                                <button className="!text-dark-1 player-button" onClick={this.setPlayButton.bind(this)}>
                                    {this.state.playButtonState === "player__button__play" ? <Play /> : <Pause />}
                                </button>
                                <button className="!text-dark-1 player-button ml-5" onClick={this.nextSong}>
                                    <FastForward size={24} className="max-w-fit" />
                                </button>
                            </div>
                        </div>
                        <div className="player-visual">
                            <div className="record-box">
                                <a href={this.state.playlistlink} target="_blank" rel="noreferrer"><img alt="record" className={this.state.record} src={this.state.playlistimg}></img></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}