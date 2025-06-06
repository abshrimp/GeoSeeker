import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/play/Header';
import StreetView from '../components/play/StreetView';
import Timer from '../components/play/Timer';
import Compass from '../components/play/Compass';
import Controls from '../components/play/Controls';
import Map from '../components/play/Map';
import Loading from '../components/play/Loading';
import RoundResult from '../components/play/RoundResult';
import './GameScreen.css';
import { useGame, storage } from '../context/GameContext';
import { apiClient } from "../api/client.ts";
import { getDistance } from 'geolib';

const GameScreen: React.FC = () => {
    const [degree, setDegree] = useState<number>(0);
    const startPerf = useRef<number | null>(null);
    const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const hasGuessedRef = useRef<boolean>(false);
    const { gameState, setGameState, appState, setAppState } = useGame();
    const [streetViewUrl, setStreetViewUrl] = useState<string>("");
    const startExecutedRef = useRef<boolean>(false);
    const [edges, setEdges] = useState<number[]>([]);
    const [cachedData, setCachedData] = useState<any>(null);

    const handleGuess = async () => {
        if (hasGuessedRef.current || panorama == null || gameState.rounds[gameState.rounds.length - 1].pano_id == "") return;
        hasGuessedRef.current = true;

        setIsLoading(true);
        setStreetViewUrl('');
        setPanorama(null);

        const round = gameState.rounds[gameState.rounds.length - 1];

        const distance = round.guess_lat && round.guess_lng ? getDistance(
            { latitude: round.correct_lat, longitude: round.correct_lng },
            { latitude: round.guess_lat, longitude: round.guess_lng }
        ) : -1;
        round.distance = distance;

        const score = round.guess_lat && round.guess_lng ? Math.round(5000 * Math.exp(-(10 * distance / gameState.max_error_distance))) : 0;
        const score2 = score < 0 ? 0 : score > 5000 ? 5000 : (Math.round(distance) <= 20 && round.guess_lat && round.guess_lng) ? 5000 : score;
        round.score = score2;

        if (!startPerf.current) startPerf.current = performance.now();
        const sec = Math.floor((performance.now() - startPerf.current) / 1000);
        const sec2 = sec < 0 ? 0 : gameState.time_limit_sec > 0 && sec > gameState.time_limit_sec ? gameState.time_limit_sec : sec;
        round.elapsed_sec = sec2;

        const updatedGameState = {
            ...gameState,
            total_score: (gameState.total_score ?? 0) + score2,
            elapsed_sec: (gameState.elapsed_sec ?? 0) + sec2,
            rounds: gameState.rounds,
        };
        setGameState(updatedGameState);

        if (!appState.isPlaying) {
            storage.setItem('score', String(score2));
            storage.setItem('distance', String(distance));
        }

        if (appState.isAuthenticated && appState.isPlaying) {
            const result = await apiClient.endRound(updatedGameState, round);
            if (result.success) {
                setAppState({
                    isShowRoundResult: true,
                });
            } else {
                alert('エラーが発生しました\nもう一度お試しください');
                window.location.reload();
            }
        } else if (gameState.rounds.length === gameState.total_rounds) {
            const result = await apiClient.addGuestGame(updatedGameState);
            if (result.success) {
                setGameState({
                    game_id: Number(result.game_id),
                });
                setAppState({
                    isShowRoundResult: true,
                });
            } else {
                alert('エラーが発生しました');
                window.location.reload();
            }
        } else {
            setAppState({
                isShowRoundResult: true,
            });
        }
        setIsLoading(false);
    };

    const startOther = async () => {
        setIsLoading(true);

        let currentMapData;
        if (!cachedData) {
            const res = await fetch('/assets/data.json');
            const data = await res.json();
            setCachedData(data);
            currentMapData = data[gameState.map_id];
        } else {
            currentMapData = cachedData[gameState.map_id];
        }

        if (gameState.max_error_distance < 0) {
            const distance = getDistance(
                { latitude: currentMapData.edges[1], longitude: currentMapData.edges[0] },
                { latitude: currentMapData.edges[3], longitude: currentMapData.edges[2] }
            );
            setGameState({
                max_error_distance: distance,
            });
        }
        setEdges(currentMapData.edges);

        let game_type = 0;
        if (!gameState.allow_move) game_type += 1;
        if (!gameState.allow_pan) game_type += 10;
        if (!gameState.allow_zoom) game_type += 100;

        const round = gameState.rounds[gameState.rounds.length - 1];
        if (round.pano_id) {
            setStreetViewUrl(`${game_type}&!4v0!6m3!1m2!1s${round.pano_id}!3f${Number(round.heading)}`);
        } else {
            const pano = currentMapData.data[Math.floor(Math.random() * currentMapData.data.length)];
            let isTooClose = false;
            for (const round of gameState.rounds) {
                if (round.correct_lat && round.correct_lng) {
                    const distance = getDistance(
                        { latitude: round.correct_lat, longitude: round.correct_lng },
                        { latitude: pano[1], longitude: pano[2] }
                    );
                    if (distance <= 200) {
                        isTooClose = true;
                        break;
                    }
                }
            }
            if (isTooClose) {
                startOther();
                return;
            }
            setStreetViewUrl(`${game_type}&!4v0!6m8!1m7!1s${pano[0]}.!2m2!1d${pano[1]}!2d${pano[2]}!3f${Math.random()*360}0!4f0!5f0`);
        }
    }

    const start = async () => {
        if (gameState.map_id >= 500000) {
            startOther();
            return;
        }

        setIsLoading(true);

        const response = await apiClient.getStreetView(gameState.map_id);

        if (gameState.max_error_distance < 0) {
            const distance = gameState.map_id != 1 ? getDistance(
                { latitude: response.edges[1], longitude: response.edges[0] },
                { latitude: response.edges[3], longitude: response.edges[2] }
            ) : 2127803.526;
            setGameState({
                max_error_distance: distance,
            });
        }
        setEdges(response.edges);

        let game_type = 0;
        if (!gameState.allow_move) game_type += 1;
        if (!gameState.allow_pan) game_type += 10;
        if (!gameState.allow_zoom) game_type += 100;

        const round = gameState.rounds[gameState.rounds.length - 1];
        if (round.pano_id) {
            setStreetViewUrl(`${game_type}&!4v0!6m3!1m2!1s${round.pano_id}!3f${Number(round.heading)}`);
        } else {
            setStreetViewUrl(`${game_type}&!4v0!6m4!1m3!2m2!1d${response.pos.lat}!2d${response.pos.lng}`);
        }
    }

    useEffect(() => {
        if (!startExecutedRef.current && !appState.isShowRoundResult) {
            startExecutedRef.current = true;
            if (!appState.isPlaying) {
                setStreetViewUrl(`0&!4v0!6m3!1m2!1s${gameState.rounds[0].pano_id}!3f0`);
            } else {
                start();
            }
        }
    }, []);

    const nextRound = () => {
        setAppState({
            isShowRoundResult: false,
        });
        hasGuessedRef.current = false;

        gameState.rounds.push({
            round_number: gameState.rounds.length + 1,
            correct_lat: 0,
            correct_lng: 0,
            pano_id: '',
            heading: 0,
            start_time: new Date(),
            guess_lat: null,
            guess_lng: null,
            score: null,
            distance: null,
            elapsed_sec: null,
        });

        setGameState({
            rounds: gameState.rounds,
        });

        start();
    }

    return (
        appState.isShowRoundResult ? (
            <RoundResult nextRound={nextRound} />
        ) : (
            <div>
                {isLoading && <Loading />}
                <Header 
                    setIsLoading={setIsLoading}
                />
                <StreetView
                    url={streetViewUrl}
                    panorama={panorama}
                    setPanorama={setPanorama}
                    onGuess={() => handleGuess()}
                />
                <Timer
                    panorama={panorama}
                    startPerf={startPerf}
                    setIsLoading={setIsLoading}
                    onGuess={handleGuess}
                    isShowRoundResult={appState.isShowRoundResult}
                />
                <div className="panorama-layout" data-qa="question">
                    <div className="panorama-main">
                        <Compass degree={degree} />
                        <Controls
                            panorama={panorama}
                            degree={degree}
                            setDegree={setDegree}
                        />
                        <Map
                            onGuess={handleGuess}
                            edges={edges}
                        />
                    </div>
                </div>
            </div>
        )
    );
};

export default GameScreen; 