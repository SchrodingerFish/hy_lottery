
export enum PrizeLevel {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
  SURPRISE = 'SURPRISE'
}

export interface Prize {
  id: PrizeLevel;
  name: string;
  total: number;
  remaining: number;
  color: string;
  soundId?: string;
}

export interface AppState {
  prizes: Prize[];
  isSpinning: boolean;
  winner: Prize | null;
  bgImage: string | null;
  bgMusic: string | null;
  customSounds: Record<PrizeLevel, string | null>;
}
