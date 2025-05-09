import React from 'react';
import { Trophy, Ruler, Timer, Share2, Home, Twitter, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import './ScoreSummary.css';
import { Game, useGame, formatDistance, formatTime, Round, encryptNumber } from '../../context/GameContext';

interface ScoreSummaryProps {
    gameState: Game;
    rounds: Round[];
}

const ScoreSummary: React.FC<ScoreSummaryProps> = ({ gameState, rounds }) => {
    const { appState, setAppState } = useGame();
    const navigate = useNavigate();

    const returnToHome = () => {
        if (appState.isShowFinalResult) {
            setAppState({ isPlaying: false, isShowFinalResult: false });
        } else {
            navigate('/game');
        }
    };

    const handleShare = () => {
        const text = `${gameState.map_name} で ${gameState.total_score?.toLocaleString()} 点獲得しました！\n#GeoSeeker\n`;
        const shareData = {
            title: 'GeoSeeker',
            text: text,
            url: `https://geoseeker.ebii.net/result?game_id=${encryptNumber(gameState.game_id)}`
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
        const text = `#GeoSeeker\n` +
            `${gameState.map_name} で ${gameState.total_score?.toLocaleString()} 点獲得しました！\n\n` +
            `⬇️詳しい結果はこちら\n`;
        const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://geoseeker.ebii.net/result?game_id=${encryptNumber(gameState.game_id)}`;
        window.open(shareUrl, '_blank');
    };

    return (
        <div className="score-summary">
            <h2 className="score-title">Final Score</h2>

            <div className="score-metrics">
                <div className="metric group">
                    <div className="metric-icon-container">
                        <Trophy className="trophy-icon2" />
                    </div>
                    <div>
                        <p className="metric-label">Score</p>
                        <p className="metric-value score">{gameState.total_score?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="metric group">
                    <div className="metric-icon-container">
                        <Ruler className="map-pin-icon2" />
                    </div>
                    <div>
                        <p className="metric-label">Total Distance</p>
                        <p className="metric-value">{formatDistance(rounds.reduce((acc, round) => acc + (round.distance ?? 0), 0))}</p>
                    </div>
                </div>

                <div className="metric group">
                    <div className="metric-icon-container">
                        <Timer className="timer-icon2" />
                    </div>
                    <div>
                        <p className="metric-label">Time</p>
                        <p className="metric-value">{formatTime(gameState.elapsed_sec ?? 0)}</p>
                    </div>
                </div>
            </div>

            <div className="rounds-grid">
                {rounds.map((round) => (
                    <div key={round.round_number} className="round-card">
                        <p className="round-label">Round {round.round_number}</p>
                        <p className="round-distance">{formatDistance(round.distance ?? -1)}</p>
                        <p className="round-time">{formatTime(round.elapsed_sec ?? 0)}</p>
                    </div>
                ))}
            </div>

            <div className="game-settings">
                <span className="settings-label">Game Settings</span>
                <div className="settings-tags">
                    <span className="settings-tag time">
                        Time: {gameState.time_limit_sec > 0 ? formatTime(gameState.time_limit_sec) : 'Unlimited'}
                    </span>
                    <span
                        className={`settings-tag ${gameState.allow_move ? 'enabled' : 'disabled'
                            }`}
                    >
                        Move: {gameState.allow_move ? 'On' : 'Off'}
                    </span>
                    <span
                        className={`settings-tag ${gameState.allow_pan ? 'enabled' : 'disabled'
                            }`}
                    >
                        Pan: {gameState.allow_pan ? 'On' : 'Off'}
                    </span>
                    <span
                        className={`settings-tag ${gameState.allow_zoom ? 'enabled' : 'disabled'
                            }`}
                    >
                        Zoom: {gameState.allow_zoom ? 'On' : 'Off'}
                    </span>
                </div>
            </div>

            <div className="action-buttons">
                {appState.isShowFinalResult ?
                    <>
                        <Button className="play-again-button" leftIcon={<Home className="share-icon" />} onClick={returnToHome}>
                            Return to Home
                        </Button>
                        <Button className="share-button" leftIcon={<Share2 className="share-icon" />} onClick={handleShare}>
                            Share Results
                        </Button>
                        <Button className="share-button share-button-x" leftIcon={<Twitter className="share-icon" />} onClick={handleXShare}>
                            Tweet
                        </Button>
                    </>
                    :
                    <Button className="play-again-button" leftIcon={<Map className="share-icon" />} onClick={returnToHome}>
                        Play Game
                    </Button>
                }
            </div>
        </div>
    );
};

export default ScoreSummary;