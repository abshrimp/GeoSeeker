import React, { useState, useEffect } from 'react';
import undoIcon from '../../../assets/images/icon-undo.svg';
import { Position, PositionWithPov } from '../../../types/Position';

interface GoBackProps {
    panorama: google.maps.StreetViewPanorama | null;
    positionHistory: PositionWithPov[];
    setPositionHistory: React.Dispatch<React.SetStateAction<PositionWithPov[]>>;
    setBackFlag: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoBack: React.FC<GoBackProps> = ({ panorama, positionHistory, setPositionHistory, setBackFlag }) => {
    const [goBackCss, setGoBackCss] = useState("");
    const [goBackDisabled, setGoBackDisabled] = useState(true);

    useEffect(() => {
        setGoBackCss(positionHistory.length <= 0 ? 'button-disabled' : "");
        setGoBackDisabled(positionHistory.length <= 0);
    }, [positionHistory]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'z' || e.key === 'Z') && !goBackDisabled) {
                goBack();
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
    }, [goBackDisabled]);

    const goBack = () => {
        setPositionHistory((prev) => {
            if (prev.length >= 1) {
                setBackFlag(true);

                const last_pos = prev[prev.length - 1];
                panorama?.setPosition(last_pos[0]);
                panorama?.setPov({ heading: last_pos[1], pitch: last_pos[2] });

                const newHistory = [...prev];
                newHistory.pop();
                return newHistory;
            }
            return prev;
        });
    };

    return (
        <div className="control">
            <span className="tooltip-reference">
                <button
                    title="一つ戻る (Z)"
                    id="goBack"
                    className={`button-small button-round-both ${goBackCss}`}
                    onClick={goBack}
                    disabled={goBackDisabled}
                >
                    <img alt="一つ戻る" src={undoIcon} width={24} height={24} className="icon" />
                </button>
            </span>
        </div>
    );
};

export default GoBack; 