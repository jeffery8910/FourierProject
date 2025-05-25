
export interface SignalComponent {
  id: string;
  frequency: number;
  amplitude: number;
  phase: number; // in radians
  color: string;
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface ComplexNumber {
  re: number;
  im: number;
}

export interface FFTResult {
  magnitudes: DataPoint[];
  phases: DataPoint[]; // Optional: for phase spectrum
}

export enum ActiveView {
  VISUALIZATION = 'visualization',
  TUTORIAL = 'tutorial',
  CSV_PROCESSOR = 'csv_processor',
}
