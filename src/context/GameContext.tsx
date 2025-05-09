import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Round {
    round_number: number;
    correct_lat: number;
    correct_lng: number;
    pano_id: string;
    heading: number;
    start_time: Date;
    guess_lat: number | null;
    guess_lng: number | null;
    score: number | null;
    distance: number | null;
    elapsed_sec: number | null;
}

export interface Game {
    game_id: number;
    username: string;
    map_id: number;
    map_name: string;
    total_rounds: number;
    allow_move: boolean;
    allow_pan: boolean;
    allow_zoom: boolean;
    time_limit_sec: number;
    max_error_distance: number;
    total_score: number | null;
    elapsed_sec: number | null;
    started_at: Date | null;
    ended_at: Date | null;
    rounds: Round[];
}

export interface App {
    username: string;
    isAuthenticated: boolean;
    isPlaying: boolean;
    isShowLoginScreen: boolean;
    isShowLogin: boolean;
    isShowRoundResult: boolean;
    isShowFinalResult: boolean;
}

interface GameContextType {
    gameState: Game;
    setGameState: (partialState: Partial<Game>) => void;
    appState: App;
    setAppState: (partialState: Partial<App>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const formatDistance = (distance: number): string => {
    if (distance < 0) return '-';
    if (distance < 1000) {
        return `${Math.round(distance).toLocaleString()} m`;
    } else if (distance < 10000) {
        return `${(Math.round(distance / 100) / 10).toLocaleString()} km`;
    } else {
        return `${Math.round(distance / 1000).toLocaleString()} km`;
    }
};

export const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
        return `${minutes}m${remainingSeconds.toString().padStart(2, '0')}s`;
    } else {
        return `${remainingSeconds.toString()}s`;
    }
};

export const storage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key) || sessionStorage.getItem(key);
        } catch (error) {
            console.warn('ストレージへのアクセスが制限されています:', error);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            try {
                sessionStorage.setItem(key, value);
            } catch (e) {
                console.warn('ストレージへのアクセスが制限されています:', e);
            }
        }
    }
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameState, _setGameState] = useState<Game>({
        game_id: 0,
        username: "",
        map_id: 0,
        map_name: "",
        total_rounds: 0,
        allow_move: true,
        allow_pan: true,
        allow_zoom: true,
        time_limit_sec: 120,
        max_error_distance: 0,
        total_score: null,
        elapsed_sec: null,
        started_at: null,
        ended_at: null,
        rounds: [],
    });

    const setGameState = (partialState: Partial<Game>) => {
        _setGameState(prev => ({ ...prev, ...partialState }));
    };

    const [appState, _setAppState] = useState<App>({
        username: "",
        isAuthenticated: false,
        isPlaying: false,
        isShowLoginScreen: false,
        isShowLogin: false,
        isShowRoundResult: false,
        isShowFinalResult: false,
    });

    const setAppState = (partialState: Partial<App>) => {
        _setAppState(prev => ({ ...prev, ...partialState }));
    };

    return (
        <GameContext.Provider value={{
            gameState,
            setGameState,
            appState,
            setAppState
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export const findMapName = (map_id: number, cities: any): string | null => {
    for (const [prefecture, citiesOrId] of Object.entries(cities)) {
        if (typeof citiesOrId === 'number') {
            if (citiesOrId === map_id) {
                return prefecture;
            }
        } else {
            for (const [city, districtsOrId] of Object.entries(citiesOrId as Record<string, unknown>)) {
                if (typeof districtsOrId === 'number') {
                    if (districtsOrId === map_id) {
                        return `${prefecture} ${city}`;
                    }
                } else {
                    for (const [district, id] of Object.entries(districtsOrId as Record<string, unknown>)) {
                        if (id === map_id) {
                            const isTokyo23 = city === "東京23区";
                            const isWard = district.endsWith("区");
                            const isAll = district === "全域";
                            if (isWard) {
                                return isTokyo23 ? `${prefecture} ${district}` : `${city} ${district}`;
                            } else if (isAll) {
                                return `${prefecture} ${city}`;
                            } else {
                                return `${prefecture} ${district}`;
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}

const SECRET = 12847;

export function encryptNumber(n: number): string {
    const masked = n ^ SECRET;
    const str = masked.toString();
    return btoa(str);
}

export function decryptNumber(encoded: string): number {
    try {
        const str = atob(encoded);
        const masked = parseInt(str, 10);
        return masked ^ SECRET;
    } catch (error) {
        console.error(error);
        alert('エラーが発生しました\nもう一度お試しください');
        window.location.href = '/daily';
        return 0;
    }
}