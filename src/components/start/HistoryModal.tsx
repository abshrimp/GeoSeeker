import React, { useRef, useEffect, useState } from 'react';
import { History, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SettingsPopup.css';
import './Leaderboard.css';
import { apiClient } from '../../api/client';
import { Game, findMapName, formatTime } from '../../context/GameContext';
import cities from '../../data/cities.json';
import { useNavigate } from 'react-router-dom';
import { useGame, encryptNumber } from '../../context/GameContext';

interface HistoryModalProps {
    isShowHistory: boolean;
    onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isShowHistory, onClose }) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const hasFetchedRef = useRef(false);
    const navigate = useNavigate();
    const [history, setHistory] = useState<Game[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const { appState } = useGame();

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        
        if (isShowHistory) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isShowHistory]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;
            
            const response = await apiClient.getUserHistory();
            if (response.success) {
                setHistory(response.history);
                setHasMore(response.pagination.has_next);
                setPage(response.pagination.current_page);
            }
        }
        if (appState.isAuthenticated) {
            fetchHistory();
        }
    }, [appState.isAuthenticated]);

    const onLoadMore = () => {
        const fetchHistory = async () => {
            const response = await apiClient.getUserHistory(page + 1);
            if (response.success) {
                setHistory([...history, ...response.history]);
                setHasMore(response.pagination.has_next);
                setPage(response.pagination.current_page);
            }
        }
        fetchHistory();
    }

    return (
        <AnimatePresence>
            {isShowHistory && (
                <div className="settingspopup-overlay">
                    <motion.div
                        ref={popupRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="settingspopup-root"
                        style={{ maxHeight: '80vh', overflow: 'hidden' }}
                    >
                        <div className="settingspopup-header">
                            <div className="settingspopup-title-container">
                                <History size={20} className="history-icon" />
                                <h3 className="settingspopup-title">History</h3>
                            </div>
                            <button 
                                onClick={onClose}
                                className="settingspopup-close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="settingspopup-content" style={{ maxHeight: 'calc(80vh - 80px)', overflowY: 'auto' }}>
                            {history.length === 0 ? (
                                <div className="empty-state">No history yet</div>
                            ) : (
                                <>
                                    {history.map((h, i) => (
                                        <div key={i} className="entry">
                                            <div className="entry-content">
                                                <div className="entry-left">
                                                    <div className="entry-info">
                                                        <p className="username">{findMapName(h.map_id, cities)}</p>
                                                        <div className="entry-date">
                                                            <span>{h.started_at ? new Date(h.started_at).toLocaleDateString() : ''}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="entry-right">
                                                    <p className="score">{h.total_score?.toLocaleString()}</p>
                                                    <div className="entry-time">
                                                        <Clock className="clock-icon" />
                                                        <span>{formatTime(h.elapsed_sec ?? 0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="see-detail-btn" onClick={() => navigate(`/result?game_id=${encryptNumber(h.game_id)}`)}>See Detail</button>
                                        </div>
                                    ))}
                                    {hasMore && (
                                        <div className="load-more-container">
                                            <button className="load-more-btn" onClick={onLoadMore}>
                                                Load More
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HistoryModal; 