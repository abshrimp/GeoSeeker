export interface GameSettings {
  timeLimit: number;
  allowMove: boolean;
  allowPan: boolean;
  allowZoom: boolean;
}

export interface MapData {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  plays: number;
}

export type RuleSet = 'all' | 'official';

export interface GameState {
  isPlaying: boolean;
  currentMap: MapData | null;
  score: number;
  remainingTime: number;
  settings: GameSettings;
} 