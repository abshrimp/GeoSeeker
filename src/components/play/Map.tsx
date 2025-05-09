import React, { useState, useEffect, useRef } from 'react';
import stickIcon from '../../assets/images/stick.svg';
import mapIcon from '../../assets/images/map.svg';
import GuessIcon from '../../assets/images/guess.svg';
import L, { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { useGame, storage } from '../../context/GameContext';

interface MapProps {
    onGuess: () => void;
    edges: number[];
}

const Map: React.FC<MapProps> = ({ onGuess, edges }) => {
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<Marker | null>(null);
    const isInitializedRef = useRef<boolean>(false);
    const isMapInitializedRef = useRef<boolean>(false);
    const [guessFlag, setGuessFlag] = useState<boolean>(false);
    const [canvasStyle, setCanvasStyle] = useState<React.CSSProperties>({});
    const [mapCss, setMapCss] = useState<string>('');
    const [lockFlag, setLockFlag] = useState<boolean>(false);
    const [isMapVisible, setIsMapVisible] = useState<boolean>(false);
    const { gameState, setGameState, appState } = useGame();

    const icon = L.icon({
        iconUrl: GuessIcon,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    useEffect(() => {
        if (!mapRef.current && !isInitializedRef.current) {
            const isWide = document.documentElement.clientWidth > 679;

            mapRef.current = L.map('guess_map_canvas', {
                zoomControl: isWide,
            });

            L.tileLayer(
                'https://www.google.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i693439125!3m12!2sja!3sJP!5e289!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!4e0!5m1!5f4',
                {
                    attribution: '©️ <a href="https://www.google.com/maps/" target="_blank">Google</a>',
                    maxZoom: 20,
                    maxNativeZoom: 20,
                }
            ).addTo(mapRef.current);

            if (isWide) mapRef.current.zoomControl.setPosition('topright');

            const resizeObserver = new ResizeObserver(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                }
            });
            if (mapRef.current.getContainer()) {
                resizeObserver.observe(mapRef.current.getContainer());
            }

            isInitializedRef.current = true;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                isInitializedRef.current = false;
            }
        };
    }, []);

    useEffect(() => {
        if (mapRef.current) {
            if (edges && edges.length === 4) {
                const lat = (edges[3] - edges[1]) / 4;
                const lng = (edges[2] - edges[0]) / 4;
                const bounds = L.latLngBounds(
                    L.latLng(edges[1] + lat, edges[0] + lng),
                    L.latLng(edges[3] - lat, edges[2] - lng)
                );
                mapRef.current.fitBounds(bounds);
            } else {
                mapRef.current.setView([35.4, 136], 5);
            }
        }
    }, [edges]);

    useEffect(() => {
        if (!isMapVisible || isMapInitializedRef.current || !mapRef.current) return;
        isMapInitializedRef.current = true;
        mapRef.current.invalidateSize();
        if (edges && edges.length === 4) {
            const bounds = L.latLngBounds(
                L.latLng(edges[1], edges[0]),
                L.latLng(edges[3], edges[2])
            );
            mapRef.current.fitBounds(bounds);
        } else {
            mapRef.current.setView([35.4, 136], 5);
        }
    }, [isMapVisible]);

    const onMapClick = (e: L.LeafletMouseEvent) => {
        if (mapRef.current) {
            if (markerRef.current) {
                mapRef.current.removeLayer(markerRef.current);
            } else {
                setGuessFlag(true);
            }

            markerRef.current = L.marker(e.latlng, { icon }).addTo(mapRef.current);

            const currentRound = gameState.rounds[gameState.rounds.length - 1];
            const latlng = markerRef.current.getLatLng();
            let lng = latlng.lng % 360;
            if (lng < currentRound.correct_lng - 180) lng += 360;
            else if (currentRound.correct_lng + 180 < lng) lng -= 360;
            currentRound.guess_lat = latlng.lat;
            currentRound.guess_lng = lng;
            setGameState({
                rounds: gameState.rounds
            });

            if (!appState.isPlaying) {
                storage.setItem('guess_lat', String(latlng.lat));
                storage.setItem('guess_lng', String(lng));
            }
        }
    };

    const resizer = () => {
        let startX: number, startY: number, startWidth: number, startHeight: number;
        const streetView = document.getElementById('streetView');

        const initResize = (e: MouseEvent) => {
            e.stopPropagation();
            startX = e.clientX;
            startY = e.clientY;
            const guessMapCanvas = document.getElementById('guess_map_canvas');
            if (guessMapCanvas) {
                startWidth = parseInt(window.getComputedStyle(guessMapCanvas).width, 10);
                startHeight = parseInt(window.getComputedStyle(guessMapCanvas).height, 10);
            }
            setMapCss('guess-map-canvas-resize');
            if (streetView) {
                streetView.className += ' street-view-stop';
            }
            document.documentElement.addEventListener('mousemove', doResize, false);
            document.documentElement.addEventListener('mouseup', stopResize, false);
        };

        const doResize = (e: MouseEvent) => {
            setCanvasStyle({
                '--map-width': `${startWidth - e.clientX + startX}px`,
                '--map-height': `${startHeight - e.clientY + startY}px`,
            } as React.CSSProperties);
        };

        const stopResize = (e: MouseEvent) => {
            storage.setItem('width', String(startWidth - e.clientX + startX));
            storage.setItem('height', String(startHeight - e.clientY + startY));
            if (streetView) {
                streetView.className = streetView.className.replace(' street-view-stop', '');
            }
            setMapCss('');
            document.documentElement.removeEventListener('mousemove', doResize, false);
            document.documentElement.removeEventListener('mouseup', stopResize, false);
        };

        const resizerElement = document.getElementById('resizer');
        if (resizerElement) {
            resizerElement.addEventListener('mousedown', initResize, false);
        }

        const resizeWidth = storage.getItem('width');
        if (resizeWidth) {
            setCanvasStyle({
                '--map-width': `${resizeWidth}px`,
                '--map-height': `${storage.getItem('height') || '0'}px`,
            } as React.CSSProperties);
        }
    };

    const mapPin = (e: MouseEvent) => {
        e.stopPropagation();
        setLockFlag((prev) => !prev);
    };

    const toggleMap = () => {
        setIsMapVisible(!isMapVisible);
    };

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.on('click', onMapClick);
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ') onGuess();
        };
        document.addEventListener('keydown', handleKeyDown);

        resizer();

        const pinner = document.getElementById('pinner');
        if (pinner) {
            pinner.addEventListener('click', mapPin, false);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.off('click', onMapClick);
            }
            document.removeEventListener('keydown', handleKeyDown);
            if (pinner) {
                pinner.removeEventListener('click', mapPin, false);
            }
        };
    }, [guessFlag]);

    return (
        <div className="map-container">
            <div id="guess_map" className={`guess-map ${mapCss} ${lockFlag ? 'guess-map-hover' : ''} ${isMapVisible ? '' : 'guess-map-hidden'}`}>
                <div
                    id="guess_map_canvas"
                    className="guess-map-canvas"
                    style={canvasStyle}
                >
                    <div title="ドラッグで地図サイズを変更" id="resizer" className="resizer"></div>
                    <button
                        title="地図のサイズを固定"
                        id="pinner"
                        className={`pinner ${lockFlag ? 'pinner-pin' : ''}`}
                    >
                        <img alt="地図のサイズを固定" src={stickIcon} width={32} height={32} className="pinner-img" />
                    </button>
                </div>
                <div className="guess-map-button">
                    <button
                        id="guess_btn"
                        className={`guess-button ${guessFlag ? 'guess-allowed' : 'button-disabled'}`}
                        onClick={onGuess}
                        disabled={!guessFlag}
                    >
                        <span>{guessFlag ? 'GUESS' : 'PLACE YOUR PIN ON THE MAP'}</span>
                    </button>
                </div>
            </div>
            <div id="guess_map_toggle" className="guess-map_toggle">
                <button title="地図の表示/非表示を切り替え" onClick={toggleMap}>
                    <img alt="Guess button icon" src={mapIcon} width={24} height={24} />
                </button>
            </div>
        </div>
    );
};

export default Map;