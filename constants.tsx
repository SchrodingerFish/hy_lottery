
import { PrizeLevel, Prize } from './types';

export const INITIAL_PRIZES: Prize[] = [
  {
    id: PrizeLevel.FIRST,
    name: '新年至尊礼盒',
    total: 2,
    remaining: 2,
    color: '#FFD700', // Gold
  },
  {
    id: PrizeLevel.SECOND,
    name: '新年高级礼盒',
    total: 6,
    remaining: 6,
    color: '#FF8C00', // DarkOrange
  },
  {
    id: PrizeLevel.THIRD,
    name: '新年祝福礼盒',
    total: 12,
    remaining: 12,
    color: '#FF4500', // OrangeRed
  },
  {
    id: PrizeLevel.SURPRISE,
    name: '新年礼品',
    total: 60,
    remaining: 60,
    color: '#CD5C5C', // IndianRed
  }
];

export const WHEEL_SIZE = 500;
