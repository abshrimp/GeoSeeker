import React, { useEffect, useRef } from 'react';
import { X, Clock, Move, ZoomIn, RotateCw, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, formatTime } from '../../context/GameContext';
import './SettingsPopup.css';

interface SettingsPopupProps {
    isShowSettings: boolean;
    onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isShowSettings, onClose }) => {
    const { gameState, setGameState } = useGame();
    const popupRef = useRef<HTMLDivElement>(null);

    const getCurrentRuleset = () => {
        const { time_limit_sec, allow_move, allow_pan, allow_zoom } = gameState;

        if (time_limit_sec === 120 && allow_move && allow_pan && allow_zoom) {
            return 'Official Rules';
        }

        if (!allow_move && !allow_pan && !allow_zoom) {
            return 'NMPZ';
        }

        return 'Custom Rules';
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = (parseInt(e.target.value) + 10) % 610;
        setGameState({ time_limit_sec: value });
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isShowSettings) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isShowSettings]);

    return (
        <AnimatePresence>
            {isShowSettings && (
                <div className="settingspopup-overlay">
                    <motion.div
                        ref={popupRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="settingspopup-root"
                    >
                        <div className="settingspopup-header">
                            <h3 className="settingspopup-title">Game Settings</h3>
                            <button
                                onClick={onClose}
                                className="settingspopup-close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="settingspopup-content">
                            <div className="settingspopup-rules-row">
                                <SettingsIcon size={18} className="settingspopup-icon-blue" />
                                <h4 className="settingspopup-rules">Current Rules: {getCurrentRuleset()}</h4>
                            </div>
                            <div>
                                <div className="settingspopup-timer-row">
                                    <div className="settingspopup-timer-label">
                                        <Clock size={18} className="settingspopup-icon-blue" />
                                        <h4 className="settingspopup-timer-text">Round Time Limit: {gameState.time_limit_sec > 0 ? formatTime(gameState.time_limit_sec) : 'No Limit'}</h4>
                                    </div>
                                </div>
                                <div className="settingspopup-timer-slider-row">
                                    <span className="settingspopup-timer-min">10s</span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={600}
                                        step={10}
                                        value={gameState.time_limit_sec > 0 ? gameState.time_limit_sec - 10 : 600}
                                        onChange={handleTimeChange}
                                        className="settingspopup-timer-slider"
                                    />
                                    <span className="settingspopup-timer-max">∞</span>
                                </div>
                            </div>
                            <div className="settingspopup-options">
                                <h4 className="settingspopup-options-title">Gameplay Options</h4>
                                <div className="settingspopup-option-row">
                                    <div className="settingspopup-option-label">
                                        <Move size={18} className="settingspopup-icon-blue" />
                                        <span className="settingspopup-option-text">Allow Movement</span>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setGameState({
                                                allow_pan: !gameState.allow_move ? true : gameState.allow_pan,
                                                allow_move: !gameState.allow_move,
                                            })
                                        }
                                        className={`settingspopup-switch ${gameState.allow_move ? 'settingspopup-switch-on' : 'settingspopup-switch-off'}`}
                                    >
                                        <span
                                            className={`settingspopup-switch-knob ${gameState.allow_move ? 'settingspopup-switch-knob-on' : 'settingspopup-switch-knob-off'}`}
                                        />
                                    </button>
                                </div>
                                <div className="settingspopup-option-row">
                                    <div className="settingspopup-option-label">
                                        <RotateCw size={18} className="settingspopup-icon-blue" />
                                        <span className="settingspopup-option-text">Allow Panning</span>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setGameState({
                                                allow_move: gameState.allow_pan ? false : gameState.allow_move,
                                                allow_pan: !gameState.allow_pan,
                                            })
                                        }
                                        className={`settingspopup-switch ${gameState.allow_pan ? 'settingspopup-switch-on' : 'settingspopup-switch-off'}`}
                                    >
                                        <span
                                            className={`settingspopup-switch-knob ${gameState.allow_pan ? 'settingspopup-switch-knob-on' : 'settingspopup-switch-knob-off'}`}
                                        />
                                    </button>
                                </div>
                                <div className="settingspopup-option-row">
                                    <div className="settingspopup-option-label">
                                        <ZoomIn size={18} className="settingspopup-icon-blue" />
                                        <span className="settingspopup-option-text">Allow Zooming</span>
                                    </div>
                                    <button
                                        onClick={() => setGameState({ allow_zoom: !gameState.allow_zoom })}
                                        className={`settingspopup-switch ${gameState.allow_zoom ? 'settingspopup-switch-on' : 'settingspopup-switch-off'}`}
                                    >
                                        <span
                                            className={`settingspopup-switch-knob ${gameState.allow_zoom ? 'settingspopup-switch-knob-on' : 'settingspopup-switch-knob-off'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="settingspopup-buttons">
                            <button
                                onClick={() => {
                                    setGameState({
                                        time_limit_sec: 120,
                                        allow_move: true,
                                        allow_pan: true,
                                        allow_zoom: true
                                    });
                                }}
                                className="settingspopup-btn-official"
                            >
                                Official Rules
                            </button>
                            <button
                                onClick={() => {
                                    setGameState({
                                        time_limit_sec: 0,
                                        allow_move: false,
                                        allow_pan: false,
                                        allow_zoom: false
                                    });
                                }}
                                className="settingspopup-btn-nmpz"
                            >
                                NMPZ
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsPopup; 