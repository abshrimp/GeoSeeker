import React from 'react';
import { LogOut } from 'lucide-react';
import './Header.css';
import { useGame } from '../../context/GameContext';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

const Header: React.FC<{ setIsLoading: (isLoading: boolean) => void }> = ({ setIsLoading }) => {
    const { gameState, appState, setAppState } = useGame();
    const navigate = useNavigate();

    async function onExit() {
        if (window.confirm('ゲームを中断しますか？\n中断すると再開できません')) {
            if (appState.isAuthenticated) {
                setIsLoading(true);
                const result = await apiClient.abortGame(gameState.game_id);
                if (!result.success) {
                    alert('エラーが発生しました\nもう一度お試しください');
                    window.location.reload();
                } else {
                    setAppState({
                        isPlaying: false,
                    });
                    navigate('/game');
                }
            } else {
                setAppState({
                    isPlaying: false,
                });
                navigate('/game');
            }
        }
    }

    const onPlayOtherMap = () => {
        navigate('/game');
    };

    return (
        <header className="gamescreen-header">
            <div className="gamescreen-header-inner">
                <div className="gamescreen-header-left">
                    <div className="gamescreen-status-box">
                        <div className="gamescreen-status-item gamescreen-hide">
                            <div className="gamescreen-status-label">Map</div>
                            <div className="gamescreen-status-value">{gameState.map_name.replace("その他のマップ ", "") ?? '-'}</div>
                        </div>
                        <div className="gamescreen-status-divider gamescreen-hide" />
                        <div className="gamescreen-status-item">
                            <div className="gamescreen-status-label">{appState.isPlaying ? "Round" : "Day"}</div>
                            <div className="gamescreen-status-value">
                                {gameState.rounds[gameState.rounds.length - 1]?.round_number ?? 1}{appState.isPlaying ? " / " + gameState.total_rounds : ""}
                            </div>
                        </div>
                        <div className="gamescreen-status-divider" />
                        <div className="gamescreen-status-item gamescreen-score-item">
                            <div className="gamescreen-status-label">{appState.isPlaying ? "Score" : "Move"}</div>
                            <div className="gamescreen-status-value">{gameState.total_score?.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                <div className="gamescreen-header-right">
                    {appState.isPlaying ? (
                        <button className="gamescreen-exit-btn" onClick={onExit} aria-label="Exit">
                            <LogOut size={22} strokeWidth={2.2} />
                        </button>
                    ) : (
                        <button className="gamescreen-play-other-btn" onClick={onPlayOtherMap} aria-label="Play Other Game">
                            <span className="gamescreen-play-other-text">
                                <span className="gamescreen-play-other-line">Other</span>
                                <span className="gamescreen-play-other-line">Map</span>
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;