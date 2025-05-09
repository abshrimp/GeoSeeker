import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GameProvider, useGame, Round, findMapName } from './context/GameContext';
import LoginScreen from './screens/LoginScreen';
import StartScreen from './screens/StartScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import DailyScreen from './screens/DailyScreen';
import { apiClient } from './api/client';
import cities from './data/cities.json';
import SEO from './components/SEO';

const GameFlow: React.FC = () => {
    const { setGameState, appState, setAppState } = useGame();
    const fetchGameResultRef = useRef<boolean>(false);

    
    const fetchGameResult = async () => {
        const response = await apiClient.getActiveGame();
        if (response.success && response.username) {
            setAppState({
                isAuthenticated: true,
                username: response.username,
            });
        }

        if (response.success && response.active) {
            const game = response.game;
            game.map_name = findMapName(game.map_id, cities);
            game.allow_move = game.allow_move === 1;
            game.allow_pan = game.allow_pan === 1;
            game.allow_zoom = game.allow_zoom === 1;
            game.started_at = new Date(game.started_at);
            game.total_score = response.rounds.reduce((acc: number, round: Round) => acc + (round.score || 0), 0);
            game.elapsed_sec = response.rounds.reduce((acc: number, round: Round) => acc + (round.elapsed_sec || 0), 0);
            game.rounds = response.rounds;
            game.rounds.forEach((round: Round) => {
                round.start_time = new Date(round.start_time);
            });
            setGameState({ ...game });
            if (game.rounds[game.rounds.length - 1].elapsed_sec === null) {
                setAppState({
                    isPlaying: true,
                    isShowRoundResult: false,
                });
            } else {
                setAppState({
                    isPlaying: true,
                    isShowRoundResult: true,
                });
            }
        }
    };

    useEffect(() => {
        if (!fetchGameResultRef.current) {
            fetchGameResultRef.current = true;
            fetchGameResult();
        }
    }, []);

    if (appState.isShowLoginScreen) {
        return (
            <>
                <SEO title="Login - GeoSeeker" />
                <LoginScreen />
            </>
        );
    }

    if (appState.isPlaying) {
        return (
            <>
                <SEO />
                <GameScreen />
            </>
        );
    }

    if (appState.isShowFinalResult) {
        return (
            <>
                <SEO  title="Result - GeoSeeker" />
                <ResultScreen />
            </>
        );
    }

    return (
        <>
            <SEO title="Home - GeoSeeker" />
            <StartScreen />
        </>
    );
};


const RouteChangeHandler: React.FC = () => {
    const location = useLocation();
    const { setGameState, setAppState } = useGame();

    useEffect(() => {
        setGameState({
            total_rounds: 0,
            max_error_distance: 0,
            total_score: 0,
            elapsed_sec: null,
            started_at: null,
            ended_at: null,
            rounds: [],
        });
        setAppState({
            isPlaying: false,
            isShowLoginScreen: false,
            isShowRoundResult: false,
            isShowFinalResult: false,
        });
    }, [location.pathname]);

    return null;
};

const DevToolsDetector: React.FC = () => {
    useEffect(() => {
        const debuggerLoop = () => {
            debugger;
            setTimeout(debuggerLoop, 100);
        };
        debuggerLoop();

    }, []);

    return null;
};

function App() {
    return (
        <GameProvider>
            <Router>
                <DevToolsDetector />
                <RouteChangeHandler />
                <Routes>
                    <Route path="/game" element={<GameFlow />} />
                    <Route path="/result" element={
                        <>
                            <SEO 
                                title="Result - GeoSeeker"
                            />
                            <ResultScreen />
                        </>
                    } />
                    <Route path="/daily" element={
                        <>
                            <SEO />
                            <DailyScreen />
                        </>
                    } />
                    <Route path="/favicon.ico" element={null} />
                    <Route path="/assets/*" element={null} />
                    <Route path="*" element={
                        <>
                            <SEO />
                            <Navigate to="/daily" replace />
                        </>
                    } />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;