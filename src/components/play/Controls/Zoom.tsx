import React, { useState, useEffect } from 'react';
import plusIcon from '../../../assets/images/plus.svg';
import minusIcon from '../../../assets/images/minus.svg';
import { useGame } from '../../../context/GameContext';
interface ZoomProps {
    panorama: google.maps.StreetViewPanorama | null;
}

const Zoom: React.FC<ZoomProps> = ({ panorama }) => {
    const { gameState } = useGame();
    const [isVisible, setIsVisible] = useState(true);
    const [zoomIn, setZoomIn] = useState("");
    const [zoomOut, setZoomOut] = useState("");

    useEffect(() => {
        if (!gameState.allow_zoom) setIsVisible(false);
    }, []);

    useEffect(() => {
        if (panorama) {
            panorama.addListener("zoom_changed", () => {
                const zoomLv = panorama.getZoom();
                setZoomIn(zoomLv >= 4 ? 'button-disabled' : "");
                setZoomOut(zoomLv < 1 ? 'button-disabled' : "");
            });
        }
    }, [panorama]);

    const setZoom = (add: number, duration = 100) => {
        if (!panorama) return;

        const startZoom = panorama.getZoom();
        const targetZoom = Math.max(Math.min(startZoom + add, 4), 0);
        const startTime = performance.now();
        const easeOutQuad = (t: number) => t * (2 - t);

        const animateZoom = () => {
            const progress = Math.min((performance.now() - startTime) / duration, 1);
            panorama.setZoom(startZoom + (targetZoom - startZoom) * easeOutQuad(progress));
            if (progress < 1) requestAnimationFrame(animateZoom);
        };
        requestAnimationFrame(animateZoom);
    };

    return (
        <div id="controlZoom" className="control-group control-zoom">
            <span className="tooltip-reference">
                <button
                    title="ズームイン"
                    id="zoomIn"
                    className={`button-small button-round-top ${zoomIn}`}
                    style={{ display: isVisible ? 'block' : 'none' }}
                    onClick={() => setZoom(1)}
                >
                    <img alt="ズームイン" src={plusIcon} width={24} height={24} />
                </button>
            </span>
            <span className="tooltip-reference">
                <button
                    title="ズームアウト"
                    id="zoomOut"
                    className={`button-small button-round-bottom ${zoomOut}`}
                    style={{ display: isVisible ? 'block' : 'none' }}
                    onClick={() => setZoom(-1)}
                >
                    <img alt="ズームアウト" src={minusIcon} width={24} height={24} />
                </button>
            </span>
        </div>
    );
};

export default Zoom; 