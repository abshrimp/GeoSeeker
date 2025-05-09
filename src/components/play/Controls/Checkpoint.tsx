import React, { useEffect, useState } from 'react';
import addIcon from '../../../assets/images/icon-add-checkpoint.svg';
import returnIcon from '../../../assets/images/icon-return-to-checkpoint.svg';

interface Position {
    lat: number;
    lng: number;
}

interface CheckpointProps {
    panorama: google.maps.StreetViewPanorama;
    setPositionHistory: React.Dispatch<React.SetStateAction<[Position, number, number][]>>;
    setBackFlag: React.Dispatch<React.SetStateAction<boolean>>;
}

type CheckpointPosition = [Position, number, number] | null;

const Checkpoint: React.FC<CheckpointProps> = ({ panorama, setPositionHistory, setBackFlag }) => {
    const [checkpointIcon, setCheckpointIcon] = useState<string>(addIcon);
    const [checkpointPos, setCheckpointPos] = useState<CheckpointPosition>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'c' || e.key === 'C') {
                handleCheckpoint();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const streetViewIframe = document.querySelector('#streetView');
        if (streetViewIframe) {
            const iframeWindow = (streetViewIframe as HTMLIFrameElement).contentWindow;
            if (iframeWindow) {
                iframeWindow.addEventListener('keydown', handleKeyDown);
            }
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (streetViewIframe) {
                const iframeWindow = (streetViewIframe as HTMLIFrameElement).contentWindow;
                if (iframeWindow) {
                    iframeWindow.removeEventListener('keydown', handleKeyDown);
                }
            }
        };
    }, []);

    const handleCheckpoint = () => {
        const currentPov = panorama.getPov();
        const currentPos = panorama.getPosition();

        if (!currentPov || !currentPos) return;

        setCheckpointPos((prev) => {
            const current: [Position, number, number] = [
                currentPos.toJSON(),
                currentPov.heading,
                currentPov.pitch
            ];

            if (!prev) {
                setCheckpointIcon(returnIcon);
                return current;
            }

            setBackFlag(true);
            panorama.setPosition(prev[0]);
            panorama.setPov({ heading: prev[1], pitch: prev[2] });
            setPositionHistory((prevHistory) => [...prevHistory, current]);
            setCheckpointIcon(addIcon);
            return null;
        });
    };

    return (
        <div className="control">
            <span className="tooltip-reference">
                <button
                    title="チェックポイントを設定/チェックポイントに移動 (C)"
                    id="goCheckpoint"
                    className="button-small button-round-both"
                    onClick={handleCheckpoint}
                >
                    <img
                        alt="チェックポイントを設定"
                        src={checkpointIcon}
                        width={24}
                        height={24}
                        className="icon"
                    />
                </button>
            </span>
        </div>
    );
};

export default Checkpoint; 