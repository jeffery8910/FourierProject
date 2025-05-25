
import React from 'react';
import { SignalComponent } from '../types';
import { Input } from './common/Input';
import { Slider } from './common/Slider';
import { Button } from './common/Button';
import { Icon } from './common/Icon';
import { Card } from './common/Card';
import { TooltipIcon } from './common/TooltipIcon';

interface SignalInputProps {
  signal: SignalComponent;
  onUpdate: (updatedSignal: SignalComponent) => void;
  onRemove: (id: string) => void;
  index: number;
}

export const SignalInput: React.FC<SignalInputProps> = ({ signal, onUpdate, onRemove, index }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...signal, [name]: name === 'frequency' || name === 'amplitude' ? parseFloat(value) : value });
  };
  
  const handlePhaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phaseDegrees = parseFloat(e.target.value);
    onUpdate({ ...signal, phase: (phaseDegrees * Math.PI) / 180 });
  };


  return (
    <Card className="mb-4 border border-slate-700" title={`信號 ${index + 1}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <div className="flex items-center mb-1">
            <label htmlFor={`frequency-${signal.id}`} className="block text-sm font-medium text-slate-300">
              頻率: <span className="font-bold text-sky-400">{signal.frequency} Hz</span>
            </label>
            <TooltipIcon text="信號每秒重複的次數。單位是赫茲 (Hz)。" className="ml-1" align="start" />
          </div>
          <Slider
            id={`frequency-${signal.id}`}
            name="frequency"
            min="1"
            max="50" 
            step="0.5"
            value={signal.frequency}
            onChange={handleInputChange}
            aria-label={`信號 ${index + 1} 頻率`}
          />
        </div>
        <div>
          <div className="flex items-center mb-1">
            <label htmlFor={`amplitude-${signal.id}`} className="block text-sm font-medium text-slate-300">
              幅度: <span className="font-bold text-sky-400">{signal.amplitude}</span>
            </label>
            <TooltipIcon text="信號的強度或高度。影響其在組合信號中的貢獻大小。" className="ml-1" align="end" />
          </div>
          <Slider
            id={`amplitude-${signal.id}`}
            name="amplitude"
            min="0.1"
            max="2"
            step="0.1"
            value={signal.amplitude}
            onChange={handleInputChange}
            aria-label={`信號 ${index + 1} 幅度`}
          />
        </div>
        <div>
          <div className="flex items-center mb-1">
            <label htmlFor={`phase-${signal.id}`} className="block text-sm font-medium text-slate-300">
              相位 (度): <span className="font-bold text-sky-400">{parseFloat(((signal.phase * 180) / Math.PI).toFixed(1))}°</span>
            </label>
            <TooltipIcon text="信號在其周期中的起始位置。單位是度 (°)。影響多個信號如何疊加。" className="ml-1" align="start" />
          </div>
          <Slider
            id={`phase-${signal.id}`}
            name="phase" // Internally still 'phase', value mapping handles degrees
            min="0"
            max="360"
            step="1"
            value={parseFloat(((signal.phase * 180) / Math.PI).toFixed(1))}
            onChange={handlePhaseChange}
            aria-label={`信號 ${index + 1} 相位`}
          />
        </div>
        <div className="flex items-center space-x-2">
            <label htmlFor={`color-${signal.id}`} className="text-sm font-medium text-slate-300">顏色:</label>
            <Input
                type="color"
                id={`color-${signal.id}`}
                name="color"
                value={signal.color}
                onChange={handleInputChange}
                className="p-1 h-10 w-16 block"
                aria-label={`信號 ${index + 1} 顏色`}
            />
        </div>
      </div>
      <Button
        onClick={() => onRemove(signal.id)}
        variant="danger"
        size="sm"
        className="mt-4 float-right"
      >
        <Icon type="trash" className="w-4 h-4 mr-1 inline-block" /> 移除
      </Button>
      <div className="clear-both"></div>
    </Card>
  );
};