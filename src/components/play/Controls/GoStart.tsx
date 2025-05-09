import React, { useState, useEffect } from 'react';
import returnIcon from '../../../assets/images/icon-return-to-start.svg';
import { Position, PositionWithPov } from '../../../types/Position';

interface GoStartProps {
    panorama: google.maps.StreetViewPanorama | null;
    positionHistory: PositionWithPov[];
    setPositionHistory: React.Dispatch<React.SetStateAction<PositionWithPov[]>>;
    setBackFlag: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoStart: React.FC<GoStartProps> = ({ panorama, positionHistory, setPositionHistory, setBackFlag }) => {
    const [goStartCss, setGoStartCss] = useState("");
    const [goStartDisabled, setGoStartDisabled] = useState(true);

    useEffect(() => {
        setGoStartCss(positionHistory.length <= 0 ? 'button-disabled' : "");
        setGoStartDisabled(positionHistory.length <= 0);
    }, [positionHistory]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'r' || e.key === 'R') && !goStartDisabled) {
                goStart();
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
    }, [goStartDisabled]);

    const goStart = () => {
        setPositionHistory((prev) => {
            if (prev.length >= 1) {
                setBackFlag(true);

                const start_pos = prev[0];
                panorama?.setPosition(start_pos[0]);
                panorama?.setPov({ heading: start_pos[1], pitch: start_pos[2] });

                return [];
            }
            return prev;
        });
    };

    return (
        <div className="control">
            <span className="tooltip-reference">
                <button
                    title="スタートに戻る (R)"
                    id="goStart"
                    className={`button-small button-round-both ${goStartCss}`}
                    onClick={goStart}
                    disabled={goStartDisabled}
                >
                    <img alt="スタートに戻る" src={returnIcon} width={22} height={24} className="icon" />
                </button>
            </span>
        </div>
    );
};

export default GoStart; 