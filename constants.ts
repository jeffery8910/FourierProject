
import { SignalComponent } from './types';

export const MAX_SIGNAL_COMPONENTS = 5;
export const DEFAULT_SAMPLING_RATE = 1000; // Hz
export const DEFAULT_NUM_SAMPLES = 512; // Power of 2 for FFT

export const INITIAL_SIGNALS: SignalComponent[] = [
  { id: 'sig1', frequency: 5, amplitude: 1, phase: 0, color: '#8884d8' },
  { id: 'sig2', frequency: 12, amplitude: 0.5, phase: Math.PI / 2, color: '#82ca9d' },
];

export const TAB_NAMES = {
  visualization: '互動介面', // Changed from '互動演示'
  tutorial: '學習傅立葉轉換',
  csv_processor: 'CSV 分析器',
};