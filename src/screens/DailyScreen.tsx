import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import Loading from "../components/play/Loading2";
import SEO from "../components/SEO";
import GameScreen from "./GameScreen";
import { useGame } from "../context/GameContext";
import { apiClient } from "../api/client";

const DailyScreen: React.FC = () => {
    const { setGameState, setAppState } = useGame();
    const [isLoading, setIsLoading] = useState(true);
    const getDailyRef = useRef<boolean>(false);

    useEffect(() => {
        const getDaily = async () => {
            if (getDailyRef.current) return;
            getDailyRef.current = true;

            try {
                const response = await apiClient.getDaily();
                if (response.success) {
                    let total_score = 0,
                        guess_lat = null,
                        guess_lng = null,
                        score = null,
                        distance = null;
                    if (localStorage.getItem('stage') == response.num) {
                        total_score = Number(localStorage.getItem('move_count'));
                        guess_lat = Number(localStorage.getItem('guess_lat'));
                        guess_lng = Number(localStorage.getItem('guess_lng'));
                        score = Number(localStorage.getItem('score'));
                        distance = Number(localStorage.getItem('distance'));
                        if (score > 0) {
                            setAppState({
                                isShowRoundResult: true,
                            });
                        }
                    } else {
                        localStorage.setItem('stage', response.num);
                        localStorage.setItem('move_count', '0');
                        localStorage.setItem('guess_lat', '');
                        localStorage.setItem('guess_lng', '');
                        localStorage.setItem('score', '');
                        localStorage.setItem('distance', '');
                    }
                    setGameState({
                        game_id: 0,
                        map_name: "Daily",
                        total_rounds: 0,
                        max_error_distance: 2127803.526,
                        total_score: total_score,
                        time_limit_sec: 0,
                        elapsed_sec: null,
                        started_at: null,
                        ended_at: null,
                        rounds: [{
                            round_number: response.num,
                            correct_lat: Number(response.lat),
                            correct_lng: Number(response.lng),
                            pano_id: response.pano_id,
                            heading: 0,
                            start_time: new Date(),
                            guess_lat: guess_lat,
                            guess_lng: guess_lng,
                            score: score,
                            distance: distance,
                            elapsed_sec: null,
                        }],
                    });
                } else {
                    alert('エラーが発生しました\nもう一度お試しください');
                    window.location.reload();
                }
            } catch (error) {
                alert('エラーが発生しました\nもう一度お試しください');
                window.location.reload();
            } finally {
                setIsLoading(false);
            }
        };

        getDaily();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return <GameScreen />;
};

export default DailyScreen;