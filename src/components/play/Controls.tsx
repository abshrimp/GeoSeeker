import React, { useState, useEffect, useRef } from 'react';
import './Controls.css';
import Zoom from './Controls/Zoom';
import GoBack from './Controls/GoBack';
import GoStart from './Controls/GoStart';
import Checkpoint from './Controls/Checkpoint';
import RotatingCompass from './Controls/RotatingCompass';
import { useGame } from '../../context/GameContext';

interface Position {
    lat: number;
    lng: number;
}

interface ControlsProps {
    panorama: google.maps.StreetViewPanorama | null;
    degree: number;
    setDegree: (degree: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ panorama, degree, setDegree }) => {
    const { gameState, setGameState, appState } = useGame();

    // 移動履歴
    const [positionHistory, setPositionHistory] = useState<[Position, number, number][]>([]);
    const startHeadingRef = useRef<number | null>(null);  // スタート地点の方角

    const countRef = useRef(gameState.total_score ?? 0);
    useEffect(() => {
        if (!appState.isPlaying && positionHistory.length > 0) {
            setGameState({
                total_score: countRef.current
            });
        }
    }, [positionHistory, countRef.current]);

    const setPos = (newItem: [Position, number, number]) => {
        setPositionHistory((prevItems) => {
            if (prevItems.length === 0) {
                newItem[1] = startHeadingRef.current ?? 0;
                newItem[2] = 0;
                return [newItem];
            } else {
                const prev = prevItems[prevItems.length - 1][0];
                if (prev.lat === newItem[0].lat && prev.lng === newItem[0].lng) return prevItems;  // 連続クリックで同じpano_idでも発火するので、それの処理
                return [...prevItems, newItem];
            }
        });
    };

    // 移動リスナー
    const [backFlag, setBackFlag] = useState<boolean>(false); // back系の関数のsetPositionによる発火を無視
    const position_listener = () => {
        if (!panorama) return;
        const currentPov = panorama.getPov();
        const currentPos = panorama.getPosition();
        if (currentPov && currentPos) {
            if (!appState.isPlaying) {
                countRef.current++;
                localStorage.setItem('move_count', String(countRef.current));
            }
            setBackFlag((flag) => {     // back系の関数のsetPositionによる発火（flag = true）なら無視
                if (!flag) setPos([currentPos.toJSON(), currentPov.heading, currentPov.pitch]);
                return false;
            });
        }
    };

    // 方角リスナー
    const pov_listener = () => {
        if (!panorama) return;
        const heading = panorama.getPov().heading;
        setDegree(heading);     // これでcompassが動く
        if (startHeadingRef.current === null) {
            startHeadingRef.current = heading;  // スタート地点の方角を保存
        }
    };

    // リスナー登録（場所移動/方角変更）
    useEffect(() => {
        if (panorama) {
            panorama.addListener('pano_changed', position_listener);
            panorama.addListener('pov_changed', pov_listener);
        }
    }, [panorama]);

    if (!panorama) return null;

    return (
        <aside className="controls">
            <div className={`control-grid ${gameState.allow_zoom ? "" : "control-grid-disable-zoom"}`}>
                <div className="control-column control-column-right">
                    <RotatingCompass degree={degree} />
                    <Zoom panorama={panorama} />
                </div>
                {gameState.allow_move && (
                    <div className="control-column control-column-left">
                        <GoBack
                            panorama={panorama}
                            positionHistory={positionHistory}
                            setPositionHistory={setPositionHistory}
                            setBackFlag={setBackFlag}
                        />
                        <Checkpoint
                            panorama={panorama}
                            setPositionHistory={setPositionHistory}
                            setBackFlag={setBackFlag}
                        />
                        <GoStart
                            panorama={panorama}
                            positionHistory={positionHistory}
                            setPositionHistory={setPositionHistory}
                            setBackFlag={setBackFlag}
                        />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Controls; 