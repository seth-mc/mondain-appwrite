import React from 'react';


export default class PlayerComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playertitle: "",
            time: "",
            playButtonState: "player__button__play",
            button: "PLAY",
            playerOpen: null,
            playerwidth: "0px",
            record: "record d",
            playlistimg: "https://i.scdn.co/image/ab67706c0000da849f1ccfe5d6e7306da42767b2",
            playlistlink: "https://open.spotify.com/playlist/3Pu801hrpVuQAlDLPrMgXo?si=0b4c6f4d8ac1473c",
        };
        this.wrapperRef = React.createRef();
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.player = null;
        this.nextSong = this.nextSong.bind(this);
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
        const script = document.createElement("script");
        script.src = "https://w.soundcloud.com/player/api.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            const iframeElement = document.querySelector("iframe.sc-widget");
            if (!iframeElement) {
                console.error("No iframe with class 'sc-widget' found.");
                return;
            }
            this.player = window.SC.Widget(iframeElement);
            this.player.bind(window.SC.Widget.Events.READY, () => {
                this.setState({ isWidgetReady: true }); // Set state to indicate widget is ready
                this.initPlayer();
            });
        };
    }

    initPlayer() {
        this.randomSong(this.player);
        this.setupPlayerBindings();
        this.setupPeriodicUpdates();
    }

    randomSong(player) {
        let randomVal = Math.random() * 10;
        for (let i = 0; i < randomVal; i++) {
            player.next();
        }
    }

    setupPlayerBindings() {
        this.player.getCurrentSound((song) => {
            this.setState({
                playertitle: song.title + ' - ' + song.artist,
                playButtonState: "player__button__play",
                record: "record rotate paused d",
            });
        });

        this.player.bind(window.SC.Widget.Events.PLAY, () => {
            this.setState({ playButtonState: "player__button__pause", record: "record rotate d" });
        });

        this.player.bind(window.SC.Widget.Events.PAUSE, () => {
            this.setState({ playButtonState: "player__button__play", record: "record rotate paused d" });
        });

        this.player.bind(window.SC.Widget.Events.FINISH, () => {
            this.randomSong(this.player);
        });
    }

    setupPeriodicUpdates() {
        this.intervalId = setInterval(() => {
            if (this.state.isWidgetReady) {
                try {
                    this.player.getCurrentSound((song) => {
                        this.setState({ playertitle: song.title });
                    });
                    this.player.getPosition((position) => {
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

    handleClickOutside(event) {
        if (this.wrapperRef) {
            if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
                this.setState({
                    playerOpen: null,
                    playerwidth: "0px",
                });
            }
        }
    }

    setPlayButton() {
        if (this.player) {
            this.player.toggle();
        }
    }

    nextSong() {
        if (this.player) {
            this.player.next();
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

    formatTime(time) {
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
                        <img className="musical-note" src="/assets/icons/musical-notes.svg" alt="musical-notes" />
                    </div>
                </div>
                <div className="player-container">
                    <div className="player">
                        <div className="player-info">
                            <div className="player-title-outer">
                                <div className={`player-title ${this.state.playertitle.length > 15 ? 'player-title-marquee' : ''}`}>
                                    {this.state.playertitle}
                                </div>
                            </div>
                            <div className="player-time">
                                <div className="current">{this.state.time}</div>
                                <div className="duration">{this.state.duration}</div>
                            </div>
                            <div className="player-controls">
                                <button className="player-button" onClick={this.setPlayButton.bind(this)}>
                                    <div className={this.state.playButtonState}></div>
                                </button>
                                <button className="player-button ff-button" onClick={this.nextSong}>
                                    <img className="ff" src="/assets/icons/fast-forward.svg" alt="ff" />
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