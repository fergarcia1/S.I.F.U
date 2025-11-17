export interface MatchEventFront {
  minute: number;
  teamShort: string;
  playerName: string;
  action: '⚽ Gol' | '🅰️ Asistencia' | '🟨 Amarilla' | '🟥 Roja';
}
