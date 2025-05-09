import { Game, Round } from '../context/GameContext';

interface EncryptedResponse {
  data: string;
  iv: string;
}

interface StreetResponse {
    mapid: number;
    pos: {
        lng: number;
        lat: number;
    };
    edges: [number, number, number, number];
    time: number;
}

const API_BASE_URL = 'https://geo.ebii.net';

type JsonObject = { [key: string]: any };

const encode = (input: JsonObject): string => {
    const s = Math.floor(Math.random() * 70 + 10);
    return encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(input)).split('').map(char => {
        return String.fromCharCode((char.charCodeAt(0) - 33 + s) % 92 + 33);
    }).reverse().join('')));
};

const encoder = (json: JsonObject): string => {
    return JSON.stringify({ data: encode(json) });
};

export const apiClient = {
    // ゲーム関連
    startRound: async (game: Game, round: Round): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/start_round.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encoder({ ...game,  ...round }),
            credentials: 'include',
        });
        return response.json();
    },

    endRound: async (game: Game, round: Round): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/end_round.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encoder({ ...game,  ...round }),
            credentials: 'include',
        });
        return response.json();
    },

    abortGame: async (game_id: number): Promise<JsonObject> => {
        await fetch(`${API_BASE_URL}/abort_game.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encoder({ game_id }),
            credentials: 'include',
        });
        return {success: true}
    },

    // ユーザー関連
    login: async (username: string, password: string): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encoder({ username, password }),
            credentials: 'include',
        });
        return response.json();
    },

    register: async (username: string, password: string): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encoder({ username, password }),
            credentials: 'include',
        });
        return response.json();
    },

    logout: async (): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/logout.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return response.json();
    },

    // データ取得
    getActiveGame: async (): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/get_active_game.php`, {
            credentials: 'include',
        });
        return response.json();
    },

    getGameResult: async (gameId: number): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/get_game_result.php?game_id=${gameId}`);
        return response.json();
    },

    getUserHistory: async (page: number = 1): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/get_user_history.php?page=${page}`, {
            credentials: 'include',
        });
        return response.json();
    },

    getRanking: async (mapId: number): Promise<JsonObject> => {
        if (mapId == 0) {
            return {success: true, rankings: [[], [], []], record: [null, null, null], play_count: 0, average_score: 0};
        }
        const response = await fetch(`${API_BASE_URL}/get_ranking.php?map_id=${mapId}`, {
            credentials: 'include',
        });
        return response.json();
    },

    getStreetView: async (mapId: number): Promise<StreetResponse> => {
        const response = await fetch(`https://api2.ebii.net/street.cgi?mapid=${mapId}`);
        if (!response.ok) {
            alert("エラーが発生しました\nもう一度お試しください");
            window.location.reload();
        }
    
        const data: EncryptedResponse = await response.json();
    
        const encryptedData = Uint8Array.from(atob(data.data), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
        const keyBase64 = 'fWJpRXz1XcdwtDRjJ/V3uFMn2tKOLraH62IkWg4H5+s=';
    
        const rawKey = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
    
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            rawKey,
            { name: 'AES-CBC' },
            false,
            ['decrypt']
        );
    
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv },
            cryptoKey,
            encryptedData
        );
    
        const decoder = new TextDecoder();
        let decryptedText = decoder.decode(decryptedBuffer);
        decryptedText = decryptedText.replace(/\0/g, '').trim();
        const parsedData: StreetResponse = JSON.parse(decryptedText);
    
        return parsedData;
    },

    addGuestGame: async (game: Game): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/add_guest_game.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encoder({ ...game }),
            credentials: 'include',
        });
        return response.json();
    },

    getDaily: async (): Promise<JsonObject> => {
        const response = await fetch(`${API_BASE_URL}/daily.php`);
        return response.json();
    },
}; 