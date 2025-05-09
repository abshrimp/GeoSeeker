import React, { useEffect, useRef, useState } from 'react';
import { useGame, Game, Round, decryptNumber } from '../context/GameContext';
import { useSearchParams } from 'react-router-dom';
import ScoreSummary from '../components/result/ScoreSummary';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ResultScreen.css';
import GuessIcon from '../assets/images/guess.svg';
import AnswerIcon from '../assets/images/flag.svg';
import { apiClient } from '../api/client';
import Loading from '../components/play/Loading';

const guessIcon = L.icon({
    iconUrl: GuessIcon,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});
const answerIcon = L.icon({
    iconUrl: AnswerIcon,
    iconSize: [25, 50],
    iconAnchor: [12.5, 47]
});

const ResultsPage: React.FC = () => {
    const { gameState, appState } = useGame();
    const [game, setGame] = useState<Game>(gameState);
    const [rounds, setRounds] = useState<Round[]>(gameState.rounds);
    const [searchParams] = useSearchParams();
    const gameId = searchParams.get('game_id');
    const numericGameId = gameId ? decryptNumber(gameId) : null;
    const isDataFetched = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!appState.isShowFinalResult) {
                if (!numericGameId) {
                    alert('エラーが発生しました\nもう一度お試しください');
                    window.location.href = '/';
                    return;
                }
                const response = await apiClient.getGameResult(numericGameId);
                if (response.success) {
                    setGame(response.game);
                    setRounds(response.rounds);
                    setIsLoading(false);
                } else {
                    alert('エラーが発生しました\nもう一度お試しください');
                    window.location.href = '/';
                }
            }
        };
        if (!isDataFetched.current) {
            isDataFetched.current = true;
            fetchData();
        }
    }, []);

    useEffect(() => {
        const mapId = 'result-map';
        const center = { lat: 35.681236, lng: 139.767125 };
        const map = L.map(mapId, {
            center,
            zoom: 8,
        });
        L.tileLayer(
            'https://www.google.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i693439125!3m12!2sja!3sJP!5e289!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!4e0!5m1!5f4',
            {
                attribution: '©️ <a href="https://www.google.com/maps/" target="_blank">Google</a>',
                maxZoom: 20,
                maxNativeZoom: 20,
            }
        ).addTo(map);

        const bounds = L.latLngBounds([]);
        rounds.forEach(round => {
            if (round.guess_lat && round.guess_lng) {
                const guessLatLng = L.latLng(round.guess_lat, round.guess_lng);
                L.marker(guessLatLng, { icon: guessIcon }).addTo(map).bindPopup(`Round ${round.round_number} - Guess`);
                bounds.extend(guessLatLng);
            }
            if (round.correct_lat && round.correct_lng) {
                const answerLatLng = L.latLng(round.correct_lat, round.correct_lng);
                L.marker(answerLatLng, { icon: answerIcon }).addTo(map).bindPopup(`Round ${round.round_number} - Answer`);
                bounds.extend(answerLatLng);
            }
            if (round.guess_lat && round.guess_lng && round.correct_lat && round.correct_lng) {
                L.polyline([
                    [round.guess_lat, round.guess_lng],
                    [round.correct_lat, round.correct_lng]
                ], {
                    color: 'black',
                    weight: 4,
                    dashArray: '15, 10'
                }).addTo(map);
            }
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 15
            });
        }

        return () => {
            map.remove();
        };
    }, [rounds]);

    return (
        <>
            {isLoading && !appState.isShowFinalResult && <Loading />}
            <div className="results-page">
                <main className="main-content">
                    <div className="resultscreen-maparea">
                        <div id="result-map" className="resultscreen-map"></div>
                    </div>
                    <ScoreSummary gameState={game} rounds={rounds} />
                </main>
            </div>
        </>
    );
};

export default ResultsPage;