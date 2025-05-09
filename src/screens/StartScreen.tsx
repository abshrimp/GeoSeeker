import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Button from '../components/ui/Button';
import Header from '../components/start/Header';
import MapSelection from '../components/start/MapSelection';
import GameSettings from '../components/start/GameSettings';
import Leaderboard from '../components/start/Leaderboard';
import HistoryModal from '../components/start/HistoryModal';
import './StartScreen.css';
import '../components/start/Leaderboard.css';

const StartScreen: React.FC = () => {
    const { setGameState, appState, setAppState } = useGame();
    const [isShowHistory, setIsShowHistory] = useState(false);
    const [stats, setStats] = useState({ plays: 0, average: 0 });

    const handleStartGame = () => {
        setGameState({
            game_id: 0,
            total_rounds: 5,
            max_error_distance: -1,
            total_score: 0,
            elapsed_sec: null,
            started_at: null,
            ended_at: null,
            rounds: [{
                round_number: 1,
                correct_lat: 0,
                correct_lng: 0,
                pano_id: '',
                heading: 0,
                start_time: new Date(),
                guess_lat: null,
                guess_lng: null,
                score: null,
                distance: null,
                elapsed_sec: null,
            }],
        });
        setAppState({
            isPlaying: true,
        });
    };

    useEffect(() => {
        if (appState.username == "") {
            const username = document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1];
            setAppState({
                username: username ?? "GUEST",
            });
        }
    }, []);

    return (
        <div className="startscreen-root">
            <Header
                setIsShowHistory={setIsShowHistory}
            />
            <main className="startscreen-main">
                <div className="startscreen-main-grid">
                    <div className="startscreen-main-left">
                        <MapSelection stats={stats}/>
                        <GameSettings />
                        <div className="startscreen-main-btnrow">
                            <Button
                                size="lg"
                                leftIcon={<Play className="startscreen-main-btnicon" />}
                                onClick={handleStartGame}
                                className="startscreen-main-btn"
                            >
                                Start Game
                            </Button>
                        </div>
                    </div>
                    <div className="startscreen-main-right">
                        <Leaderboard setStats={setStats} />
                    </div>
                </div>
            </main>
            <HistoryModal
                isShowHistory={isShowHistory}
                onClose={() => setIsShowHistory(false)}
            />
        </div>
    );
};

export default StartScreen;