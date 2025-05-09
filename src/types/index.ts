export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export interface MapData {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  plays: number;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  time: number;
  date: string;
  mapId: string;
  rules: 'official' | 'nmpz' | 'other';
}

export interface GameSettings {
  timeLimit: number;
  allowMove: boolean;
  allowPan: boolean;
  allowZoom: boolean;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GameState {
  isPlaying: boolean;
  currentMap: MapData | null;
  score: number;
  remainingTime: number;
  settings: GameSettings;
  currentRound: number;
  totalRounds: number;
  roundScores: number[];
  roundDistances: number[];
  roundTimes: number[];
  roundGuessLocations: LatLng[];
  roundAnswerLocations: LatLng[];
  showRoundResult: boolean;
  showFinalResult: boolean;
}

export type RuleSet = 'official' | 'nmpz' | 'other';