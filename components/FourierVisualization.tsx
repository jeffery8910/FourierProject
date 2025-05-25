
import React, { useState, useMemo, useCallback } from 'react';
import { SignalComponent, DataPoint, ComplexNumber } from '../types';
import { INITIAL_SIGNALS, DEFAULT_SAMPLING_RATE, DEFAULT_NUM_SAMPLES, MAX_SIGNAL_COMPONENTS } from '../constants';
import { SignalInput } from './SignalInput';
import { PlotDisplay } from './PlotDisplay';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Icon } from './common/Icon';
import { fft, getMagnitudes } from '../services/fft';
import { TooltipIcon } from './common/TooltipIcon';

const generateId = () => Math.random().toString(36).substr(2, 9);

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

export const FourierVisualization: React.FC = () => {
  const [signals, setSignals] = useState<SignalComponent[]>(INITIAL_SIGNALS);
  const [samplingRate, setSamplingRate] = useState<number>(DEFAULT_SAMPLING_RATE);
  const [numSamples, setNumSamples] = useState<number>(DEFAULT_NUM_SAMPLES);

  const handleAddSignal = useCallback(() => {
    if (signals.length < MAX_SIGNAL_COMPONENTS) {
      const newSignal: SignalComponent = {
        id: generateId(),
        frequency: 5,
        amplitude: 0.5,
        phase: 0,
        color: COLORS[signals.length % COLORS.length],
      };
      setSignals(prevSignals => [...prevSignals, newSignal]);
    }
  }, [signals.length]);

  const handleUpdateSignal = useCallback((updatedSignal: SignalComponent) => {
    setSignals(prevSignals =>
      prevSignals.map(s => (s.id === updatedSignal.id ? updatedSignal : s))
    );
  }, []);

  const handleRemoveSignal = useCallback((id: string) => {
    setSignals(prevSignals => prevSignals.filter(s => s.id !== id));
  }, []);
  
  const timeDomainData = useMemo(() => {
    const data: DataPoint[] = [];
    const dt = 1 / samplingRate;
    for (let i = 0; i < numSamples; i++) {
      const t = i * dt;
      let combinedAmplitude = 0;
      signals.forEach(sig => {
        combinedAmplitude += sig.amplitude * Math.sin(2 * Math.PI * sig.frequency * t + sig.phase);
      });
      data.push({ x: t, y: combinedAmplitude });
    }
    return data;
  }, [signals, samplingRate, numSamples]);

  const frequencyDomainData = useMemo(() => {
    if (timeDomainData.length === 0) return { magnitudes: [], maxFrequency: 0 };
    const signalValues = timeDomainData.map(p => p.y);
    const complexSpectrum: ComplexNumber[] = fft(signalValues);
    return getMagnitudes(complexSpectrum, samplingRate);
  }, [timeDomainData, samplingRate]);

  const yDomainTime = useMemo(() => {
    const maxAmp = signals.reduce((sum, s) => sum + s.amplitude, 0);
    return [-Math.max(1,maxAmp) * 1.1, Math.max(1,maxAmp) * 1.1] as [number,number];
  }, [signals]);

  const yDomainFreq = useMemo(() => {
    const maxMag = frequencyDomainData.magnitudes.reduce((max, p) => Math.max(max, p.y), 0);
    return [0, Math.max(0.1, maxMag) * 1.1] as [number,number];
  }, [frequencyDomainData]);


  return (
    <div className="space-y-8">
      <Card title="信號設定">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <div>
            <div className="flex items-center mb-1">
                <label htmlFor="samplingRate" className="block text-sm font-medium text-slate-300">取樣率 (Fs): <span className="font-bold text-sky-400">{samplingRate} Hz</span></label>
                <TooltipIcon text="取樣率決定了每秒從連續信號中提取多少樣本點。較高的取樣率可以更準確地表示高頻信號，並決定了頻譜中的最大可分析頻率 (奈奎斯特頻率 = Fs/2)。" className="ml-1" align="start" />
            </div>
            <input type="range" id="samplingRate" min="100" max="2000" step="50" value={samplingRate} onChange={e => setSamplingRate(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"/>
           </div>
           <div>
            <div className="flex items-center mb-1">
                <label htmlFor="numSamples" className="block text-sm font-medium text-slate-300">取樣點數 (N): <span className="font-bold text-sky-400">{numSamples}</span></label>
                <TooltipIcon text="用於分析的總樣本點數量。這影響 FFT 的頻率解析度和計算時間。總信號時長為 N/Fs。" className="ml-1" align="end" />
            </div>
            <select id="numSamples" value={numSamples} onChange={e => setNumSamples(Number(e.target.value))} className="w-full bg-slate-700 border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2">
                {[64, 128, 256, 512, 1024, 2048].map(val => <option key={val} value={val}>{val}</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-1">FFT 要求長度為 2 的次方。</p>
           </div>
        </div>
        {signals.map((sig, index) => (
          <SignalInput
            key={sig.id}
            signal={sig}
            onUpdate={handleUpdateSignal}
            onRemove={handleRemoveSignal}
            index={index}
          />
        ))}
        {signals.length < MAX_SIGNAL_COMPONENTS && (
          <Button onClick={handleAddSignal} variant="secondary" className="mt-2">
            <Icon type="plus" className="w-5 h-5 mr-2 inline-block" /> 新增正弦波
          </Button>
        )}
      </Card>

      <PlotDisplay
        title="時域信號 (組合)"
        data={timeDomainData}
        xAxisLabel="時間 (秒)"
        yAxisLabel="幅度"
        lineColor="#34d399" 
        yDomain={yDomainTime}
      />
      
      <PlotDisplay
        title="頻域信號 (頻譜圖)"
        data={frequencyDomainData.magnitudes}
        xAxisLabel={`頻率 (Hz) - 最大: ${frequencyDomainData.maxFrequency.toFixed(1)} Hz`}
        yAxisLabel="幅值"
        lineColor="#fb923c" 
        yDomain={yDomainFreq}
        referenceLines={signals.map(s => ({ x: s.frequency, label: `${s.frequency}Hz`, stroke: s.color }))}
      />
    </div>
  );
};