import React, { useState, useEffect } from 'react';
import Embed from './Embed';
import './StreetView.css';
import { useGame } from '../../context/GameContext';

interface StreetViewProps {
    url: string;
    panorama: google.maps.StreetViewPanorama | null;
    setPanorama: (panorama: google.maps.StreetViewPanorama | null) => void;
    onGuess: () => void;
}

const StreetView: React.FC<StreetViewProps> = ({ url, panorama, setPanorama, onGuess }) => {
    const { gameState } = useGame();
    // windowのキー入力をcanvasに伝える
    const handleKey = (e: KeyboardEvent) => {
        const iframeWindow = (document.getElementById("streetView") as HTMLIFrameElement)?.contentWindow;
        if (!iframeWindow) return;

        const canvas = iframeWindow.document.getElementsByTagName("canvas");
        if (canvas.length > 0) {
            const event = new KeyboardEvent(e.type, {
                bubbles: true,
                cancelable: true,
                key: e.key,
                code: e.code,
            });
            if (e.key === " ") iframeWindow.dispatchEvent(event);
            else canvas[0].dispatchEvent(event);
        }
    };

    const set_game_type = (panorama: google.maps.StreetViewPanorama, canvas: HTMLCanvasElement) => {
        //パンなし
        if (!gameState.allow_pan) {
            canvas.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
            canvas.addEventListener('wheel', (e) => {
                e.stopPropagation();
                if (gameState.allow_zoom) {
                    panorama.setZoom(Math.max(Math.min(panorama.getZoom() + e.deltaY / -1000, 4)));
                }
            });
            canvas.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
            });
            canvas.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            });
        }

        //ズームなし
        if (!gameState.allow_zoom) {
            canvas.addEventListener('wheel', (e) => {
                e.stopPropagation();
            });
        }

    }

    // canvasのセットを待機/キー入力リスナー登録
    useEffect(() => {
        let count = 0;

        const wait_canvas = setInterval(() => {
            const iframeElement = document.getElementById("streetView") as HTMLIFrameElement;
            if (!iframeElement) return;

            const iframeWindow = iframeElement.contentWindow;
            if (!iframeWindow) return;

            count++;

            const canvas = iframeWindow.document.getElementsByTagName("canvas");
            if (canvas.length > 0) {
                const pano = (iframeWindow as any).panorama;
                const round = gameState.rounds.length > 1 ? gameState.rounds[gameState.rounds.length - 2] : null;

                if (pano.getPano() && pano.getPosition() && pano.getPov()) {
                    if (gameState.rounds[gameState.rounds.length - 1].pano_id != "" || round == null || round.pano_id != pano.getPano()) {
                        clearInterval(wait_canvas);
                        pano.setZoom(0);
                        set_game_type(pano, canvas[0]);
                        setPanorama(pano);
                        return;
                    }
                }
            }
            if (count > 3000) {
                clearInterval(wait_canvas);
                alert('エラーが発生しました\nもう一度お試しください');
                window.location.reload();
            }
        }, 1);

        document.addEventListener('keydown', handleKey);
        document.addEventListener('keyup', handleKey);

        return () => {
            clearInterval(wait_canvas);
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('keyup', handleKey);
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' && gameState.rounds[gameState.rounds.length - 1].guess_lat !== null) {
                onGuess();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyDown);

        const streetViewIframe = document.querySelector('#streetView');
        if (streetViewIframe) {
            const iframeWindow = (streetViewIframe as HTMLIFrameElement).contentWindow;
            if (iframeWindow) {
                iframeWindow.addEventListener('keydown', handleKeyDown);
                iframeWindow.addEventListener('keyup', handleKeyDown);
            }
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyDown);
            if (streetViewIframe) {
                const iframeWindow = (streetViewIframe as HTMLIFrameElement).contentWindow;
                if (iframeWindow) {
                    iframeWindow.removeEventListener('keydown', handleKeyDown);
                    iframeWindow.removeEventListener('keyup', handleKeyDown);
                }
            }
        };
    }, [panorama, gameState.game_id]);

    return (
        <div className="street-view-container">
            <Embed inputUrl={url} />
        </div>
    );
};

export default StreetView; 