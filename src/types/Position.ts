export interface Position {
  lat: number;
  lng: number;
}

export type PositionWithPov = [Position, number, number]; 