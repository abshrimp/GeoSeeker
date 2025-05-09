import React, { useEffect, useCallback } from 'react';
import { useGame, formatDistance } from '../../context/GameContext';
import Button from '../ui/Button';
import { Ruler, MapPin, LucideArrowRight, BarChart2, Share2, Twitter, Map } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RoundResult.css';
import GuessIcon from '../../assets/images/guess.svg';
import AnswerIcon from '../../assets/images/flag.svg';
import { useNavigate } from 'react-router-dom';

const guessIcon = L.icon({
    iconUrl: GuessIcon,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});
const answerIcon = L.icon({
    iconUrl: AnswerIcon,
    iconSize: [25, 50],
    iconAnchor: [12.5, 47]
});

const RoundResult: React.FC<{ nextRound: () => void }> = ({ nextRound }) => {
    const { gameState, setAppState, appState } = useGame();
    const navigate = useNavigate();
    const roundIndex = gameState.rounds.length - 1;
    const currentScore = gameState.rounds[roundIndex].score;
    const currentDistance = gameState.rounds[roundIndex].distance;
    const guessLocation = gameState.rounds[roundIndex].guess_lat;
    const answerLocation = gameState.rounds[roundIndex].correct_lat;

    const handleNext = useCallback(() => {
        if (!appState.isPlaying) {
            navigate('/game');
            return;
        }
        if (gameState.rounds.length === gameState.total_rounds) {
            setAppState({
                isShowRoundResult: false,
                isShowFinalResult: true,
                isPlaying: false,
            });
        } else {
            nextRound();
        }
    }, [gameState.rounds.length, gameState.total_rounds, nextRound, setAppState]);

    useEffect(() => {
        const mapId = 'round-result-map';
        const map = L.map(mapId);
        L.tileLayer(
            'https://www.google.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i693439125!3m12!2sja!3sJP!5e289!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!4e0!5m1!5f4',
            {
                attribution: '©️ <a href="https://www.google.com/maps/" target="_blank">Google</a>',
                maxZoom: 20,
                maxNativeZoom: 20,
            }
        ).addTo(map);
        if (guessLocation && gameState.rounds[roundIndex].guess_lng) {
            L.marker({ lat: guessLocation, lng: gameState.rounds[roundIndex].guess_lng }, { icon: guessIcon }).addTo(map).bindPopup('YOUR GUESS');
        }
        if (answerLocation && gameState.rounds[roundIndex].correct_lng) {
            L.marker({ lat: answerLocation, lng: gameState.rounds[roundIndex].correct_lng }, { icon: answerIcon }).addTo(map).bindPopup('ANSWER');
        }

        if (guessLocation && gameState.rounds[roundIndex].guess_lng && 
            answerLocation && gameState.rounds[roundIndex].correct_lng) {
            L.polyline([
                [guessLocation, gameState.rounds[roundIndex].guess_lng],
                [answerLocation, gameState.rounds[roundIndex].correct_lng]
            ], {
                color: 'black',
                weight: 4,
                dashArray: '15, 10'
            }).addTo(map);

            const bounds = L.latLngBounds([
                [guessLocation, gameState.rounds[roundIndex].guess_lng],
                [answerLocation, gameState.rounds[roundIndex].correct_lng]
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (answerLocation && gameState.rounds[roundIndex].correct_lng) {
            map.setView([answerLocation, gameState.rounds[roundIndex].correct_lng], 13);
        } else {
            map.setView([35.6812, 139.7671], 5);
        }

        return () => {
            map.remove();
        };
    }, [guessLocation, answerLocation]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                handleNext();
            }
        };

        const timer = setTimeout(() => {
            window.addEventListener('keydown', handleKeyPress);
        }, 100);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleNext]);

    const handleShare = () => {
        const text = `Day${localStorage.getItem('stage')}\n\n`+
                    `📏dist. : ${formatDistance(Number(localStorage.getItem('distance')))}\n`+
                    `📊score: ${Number(localStorage.getItem('score')).toLocaleString()}\n`+
                    `🚶move: ${Number(localStorage.getItem('move_count')).toLocaleString()}\n\n`+
                    `#GeoSeeker #GeoSeeker${localStorage.getItem('stage')}\n`;
        const shareData = {
            title: 'GeoSeeker',
            text: text,
            url: 'https://geoseeker.ebii.net/daily'
        };
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            const shareText = `${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    alert('クリップボードにコピーしました！');
                })
                .catch((err) => {
                    console.error('クリップボードへのコピーに失敗しました:', err);
                    alert('クリップボードのコピーに対応していません');
                });
        }
    };

    const handleXShare = () => {
        const text = `#GeoSeeker #GeoSeeker${localStorage.getItem('stage')}\n`+
                    `Day${localStorage.getItem('stage')}\n\n`+
                    `📏dist. : ${formatDistance(Number(localStorage.getItem('distance')))}\n`+
                    `📊score: ${Number(localStorage.getItem('score')).toLocaleString()}\n`+
                    `🚶move: ${Number(localStorage.getItem('move_count')).toLocaleString()}\n\n`;
        const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://geoseeker.ebii.net/daily`;
        window.open(shareUrl, '_blank');
    };

    return (
        <div className="roundresult-root">
            <div className="roundresult-main">
                <div className="roundresult-maparea">
                    <div id="round-result-map" className="roundresult-map" />
                </div>
                <div className="roundresult-bar">
                    <div className="roundresult-round">
                        <div className="roundresult-roundrow">
                            <MapPin className="roundresult-roundicon" />
                            <span className="roundresult-roundtext">{appState.isPlaying ? `ROUND ${gameState.rounds[roundIndex].round_number} / ${gameState.total_rounds}` : `DAY ${gameState.rounds[roundIndex].round_number}`}</span>
                        </div>
                    </div>
                    <div className="roundresult-info">
                        <div className="roundresult-infoitem">
                            <span className="roundresult-infomain roundresult-distance">
                                <Ruler className="roundresult-infoicon roundresult-distanceicon" />
                                {formatDistance(currentDistance ?? -1)}
                            </span>
                            <span className="roundresult-infolabel roundresult-distancelabel">Distance</span>
                        </div>
                        {appState.isPlaying ? (
                            <Button
                                leftIcon={<LucideArrowRight className="roundresult-nexticon" />}
                                onClick={handleNext}
                            className="roundresult-nextbtn"
                            >
                                {gameState.rounds.length === gameState.total_rounds ? "FINISH" : "NEXT"}
                            </Button>
                        ) : (
                            <Button
                                leftIcon={<Map className="roundresult-mapicon" />}
                                onClick={handleNext}
                                className="roundresult-nextbtn"
                            >
                                More
                            </Button>
                        )}
                        <div className="roundresult-infoitem">
                            <span className="roundresult-infomain roundresult-score">
                                <BarChart2 className="roundresult-infoicon roundresult-scoreicon" />
                                {currentScore?.toLocaleString()}
                            </span>
                            <span className="roundresult-infolabel roundresult-scorelabel">Score</span>
                        </div>
                    </div>
                    {!appState.isPlaying && (
                        <div className="roundresult-share">
                            <Button
                                leftIcon={<Share2 className="roundresult-shareicon" />}
                                onClick={handleShare}
                                className="roundresult-sharebtn"
                            >
                                SHARE
                            </Button>
                            <Button
                                leftIcon={<Twitter className="roundresult-shareicon" />}
                                onClick={handleXShare}
                                className="roundresult-sharebtn"
                                data-type="x"
                            >
                                Tweet
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoundResult; 