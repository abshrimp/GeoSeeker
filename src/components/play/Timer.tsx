import { useEffect, useRef, useState } from 'react';
import './Timer.css';
import { useGame } from '../../context/GameContext';
import { apiClient } from '../../api/client';

interface TimerProps {
    panorama: google.maps.StreetViewPanorama | null;
    startPerf: { current: number | null };
    setIsLoading: (value: boolean) => void;
    onGuess: () => void;
    isShowRoundResult: boolean;
}

const Timer = ({ panorama, startPerf, setIsLoading, onGuess, isShowRoundResult }: TimerProps) => {
    const { gameState, setGameState, appState } = useGame();

    const [timeStr, setTimeStr] = useState<string>('');
    const [bar, setBar] = useState<string>('467.347');
    const [barColor, setBarColor] = useState<string>('var(--ds-color-green-80)');

    const startServerTime = useRef<number | null>(null);

    async function getServerTime(): Promise<Date> {
        const res = await fetch("/", {
            method: 'HEAD',
            cache: 'no-store',
        });
        const dateHeader = res.headers.get('Date');
        return new Date(dateHeader || Date.now());
    }

    const setProgress = (remain: number): void => {
        setBar(String((1 - remain / gameState.time_limit_sec) * 467.347));
        if (remain <= 10) setBarColor('red');
    };

    const convert_sec = (seconds: number): string => {
        const hour = Math.floor(seconds / 3600);
        const min = Math.floor((seconds % 3600) / 60);
        const sec = seconds % 60;

        let hh: string;
        if (hour < 100) {
            hh = `00${hour}`.slice(-2);
        } else {
            hh = hour.toString();
        }

        const mm = `00${min}`.slice(-2);
        const ss = `00${sec}`.slice(-2);

        let time = '';
        if (hour !== 0) {
            time = `${hh}:${mm}:${ss}`;
        } else {
            time = `${mm}:${ss}`;
        }

        return time;
    };

    useEffect(() => {
        let animationFrameId: number | null = null;

        const startRound = async () => {
            if (!panorama || isShowRoundResult) return;

            // タイマースタート
            const serverTime = await getServerTime();
            startServerTime.current = serverTime.getTime(); // ms
            startPerf.current = performance.now();
            setIsLoading(false);

            if (gameState.time_limit_sec > 0 && !isShowRoundResult) {
                animationFrameId = requestAnimationFrame(updateLoop);
            }

            const round = gameState.rounds[gameState.rounds.length - 1];

            // スタートAPI呼び出し
            if (round.correct_lat === 0) {
                const position = panorama.getPosition();
                round.correct_lat = position?.lat() ?? 0;
                round.correct_lng = position?.lng() ?? 0;
                round.pano_id = panorama.getPano();
                round.heading = panorama.getPov().heading;
                round.start_time = new Date(startServerTime.current + (performance.now() - startPerf.current));

                if (appState.isAuthenticated) {
                    const response = await apiClient.startRound(gameState, round);
                    if (response.success) {
                        setGameState({
                            game_id: Number(response.game_id),
                            rounds: gameState.rounds
                        });
                    } else {
                        alert('エラーが発生しました\nもう一度お試しください');
                        window.location.reload();
                    }
                } else {
                    setGameState({
                        rounds: gameState.rounds,
                    });
                }
            }
        };

        const updateLoop = () => {
            if (startPerf.current === null || startServerTime.current === null || isShowRoundResult) {
                return;
            }

            const now = new Date(startServerTime.current + (performance.now() - startPerf.current));

            const time_count = Math.min(
                gameState.time_limit_sec,
                gameState.time_limit_sec - (now.getTime() - gameState.rounds[gameState.rounds.length - 1].start_time.getTime()) / 1000
            );

            if (time_count <= 0) {
                onGuess();
                return;
            }

            setProgress(time_count);
            setTimeStr(convert_sec(Math.ceil(time_count)));

            if (!isShowRoundResult) {
                animationFrameId = requestAnimationFrame(updateLoop);
            }
        };

        startRound();

        return () => {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [panorama, isShowRoundResult, gameState.time_limit_sec, gameState.game_id]);

    return (
        gameState.time_limit_sec > 0 ? (
            <div className="clock-container">
                <div className="timer-container">
                    <div className="timer">{timeStr}</div>
                    <svg className="timer-svg" width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none">
                        <path
                            id="progress"
                            className="timer-path"
                            fill="rgba(0,0,0,0)"
                            strokeWidth="8"
                            d="M 100 4 L 38.56 4 C 19.55 4 4 20.2 4 40 c 0 19.8 15.55 36 34.56 36 h 122.88 C 180.45 76 196 59.8 196 40 c 0 -19.8 -15.55 -36 -34.56 -36 H 100 z"
                            style={{ strokeDasharray: '467.347', strokeDashoffset: bar, stroke: barColor }}
                        />
                    </svg>
                </div>
            </div>
        ) : null
    );
}

export default Timer;