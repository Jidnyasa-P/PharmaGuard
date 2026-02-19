
import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const styles = {
    [RiskLevel.SAFE]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [RiskLevel.ADJUST_DOSAGE]: 'bg-amber-100 text-amber-700 border-amber-200',
    [RiskLevel.TOXIC]: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  const labels = {
    [RiskLevel.SAFE]: 'Safe - Standard Dose',
    [RiskLevel.ADJUST_DOSAGE]: 'Adjust Dosage Required',
    [RiskLevel.TOXIC]: 'Toxic - Alternative Required',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[level]}`}>
      {labels[level]}
    </span>
  );
};

export default RiskBadge;
