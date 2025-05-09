import React, { useState, useEffect } from 'react';
import { Trophy, Clock, User } from 'lucide-react';
import { useGame, formatTime, encryptNumber } from '../../context/GameContext';
import Tabs from '../ui/Tabs';
import './Leaderboard.css';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
    game_id: number;
    username: string;
    total_score: number;
    elapsed_sec: number;
    started_at: string;
    ended_at: string;
}

interface LeaderboardProps {
    setStats: (stats: { plays: number, average: number }) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ setStats }) => {
    const { gameState, appState } = useGame();
    const [activeTab, setActiveTab] = useState('official');
    const navigate = useNavigate();
    const tabs = [
        { id: 'official', label: 'Official Rules' },
        { id: 'nmpz', label: 'NMPZ' },
        { id: 'all', label: 'All' },
    ];

    const [records, setRecords] = useState<{ [key: string]: LeaderboardEntry[] }>({ [tabs[0].id]: [], [tabs[1].id]: [], [tabs[2].id]: [] });
    const [bestRecord, setBestRecord] = useState<{ [key: string]: { rank: number, record: LeaderboardEntry } | null }>({ [tabs[0].id]: null, [tabs[1].id]: null, [tabs[2].id]: null });

    useEffect(() => {
        const fetchRecords = async () => {
            const response = await apiClient.getRanking(gameState.map_id);
            if (response.success) {
                setStats({ plays: response.play_count, average: response.average_score });

                setRecords({
                    [tabs[0].id]: response.rankings[0],
                    [tabs[1].id]: response.rankings[1],
                    [tabs[2].id]: response.rankings[2],
                });
                setBestRecord({
                    [tabs[0].id]: response.record[0],
                    [tabs[1].id]: response.record[1],
                    [tabs[2].id]: response.record[2],
                });

            } else {
                setStats({ plays: 0, average: 0 });
            }
        };
        fetchRecords();
    }, [gameState.map_id]);

    return (
        <div className="leaderboard">
            <div className="leaderboard-header">
                <div className="leaderboard-title">
                    <Trophy className="trophy-icon" />
                    <h2>Leaderboard</h2>
                </div>

                {gameState.map_name && (
                    <div className="map-name">
                        {gameState.map_name}
                    </div>
                )}

                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id)}
                />
            </div>

            {!gameState.map_name ? (
                <div className="empty-state">
                    Select a map to view leaderboard
                </div>
            ) : records[activeTab].length === 0 ? (
                <div className="empty-state">
                    No scores yet for this map and rule set
                </div>
            ) : (
                <>
                    <div className="entries">
                        {records[activeTab].map((entry, index) => (
                            <div key={entry.game_id} className="entry">
                                <div className="entry-content">
                                    <div className="entry-left">
                                        <div
                                            className={`rank-badge ${index === 0 ? 'rank-gold' :
                                                index === 1 ? 'rank-silver' :
                                                    index === 2 ? 'rank-bronze' : 'rank-default'
                                                }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div className="entry-info">
                                            <p className="username">{entry.username}</p>
                                            <div className="entry-date">
                                                <span>{new Date(entry.ended_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="entry-right">
                                        <p className="score">{entry.total_score.toLocaleString()}</p>
                                        <div className="entry-time">
                                            <Clock className="clock-icon" />
                                            <span>{formatTime(entry.elapsed_sec)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="see-detail-btn" onClick={() => navigate(`/result?game_id=${encryptNumber(entry.game_id)}`)}>See Detail</button>
                            </div>
                        ))}
                    </div>

                    {bestRecord[activeTab] !== null ? (
                        <div className="user-best-record">
                            <div className="user-best-record-title">
                                <User className="user-icon" />
                                <h3>Your Best Record</h3>
                            </div>
                            <div className="entry">
                                <div className="entry-content">
                                    <div className="entry-left">
                                        <div className={`rank-badge ${bestRecord[activeTab].rank === 1 ? 'rank-gold' :
                                            bestRecord[activeTab].rank === 2 ? 'rank-silver' :
                                                bestRecord[activeTab].rank === 3 ? 'rank-bronze' : 'rank-default'
                                            }`}
                                        >
                                            {bestRecord[activeTab].rank}
                                        </div>
                                        <div className="entry-info">
                                            <p className="username">{appState.username}</p>
                                            <div className="entry-date">
                                                <span>{new Date(bestRecord[activeTab].record.ended_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="entry-right">
                                        <p className="score">{bestRecord[activeTab].record.total_score.toLocaleString()}</p>
                                        <div className="entry-time">
                                            <Clock className="clock-icon" />
                                            <span>{formatTime(bestRecord[activeTab].record.elapsed_sec)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="see-detail-btn" onClick={() => navigate(`/result?game_id=${encryptNumber(bestRecord[activeTab]?.record.game_id ?? 0)}`)}>See Detail</button>
                            </div>
                        </div>
                    ) : (
                        !appState.isAuthenticated &&
                        <div className="user-best-record empty-state">
                            <h3>Please login to join rankings</h3>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Leaderboard;