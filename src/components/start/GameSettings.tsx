import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import SettingsPopup from './SettingsPopup';
import './GameSettings.css';

const GameSettings: React.FC = () => {
    const { gameState } = useGame();
    const [isShowSettings, setIsShowSettings] = useState(false);

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

    return (
        <>
            <div
                className="gamesettings-root"
                onClick={() => setIsShowSettings(true)}
            >
                <div className="gamesettings-row">
                    <div className="gamesettings-left">
                        <div className="gamesettings-iconwrap">
                            <SettingsIcon className="gamesettings-icon" />
                        </div>
                        <div>
                            <span className="gamesettings-label">Current Rules:</span>
                            <span className="gamesettings-value">{getCurrentRuleset()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <SettingsPopup
                isShowSettings={isShowSettings}
                onClose={() => setIsShowSettings(false)}
            />
        </>
    );
};

export default GameSettings;