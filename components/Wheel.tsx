
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Prize, PrizeLevel } from '../types';

interface WheelProps {
  prizes: Prize[];
  rotation: number;
  isSpinning: boolean;
  flash: boolean;
  winner: Prize | null;
}

const Wheel: React.FC<WheelProps> = ({ prizes, rotation, isSpinning, flash, winner }) => {
  const size = 500;
  const radius = size / 2;
  const center = size / 2;

  const segments = useMemo(() => {
    return prizes.map((prize, index) => {
      // Each segment is 90 degrees
      const startAngle = index * 90;
      const endAngle = (index + 1) * 90;
      
      const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      // Text position: middle of the segment
      const textAngle = startAngle + 45;
      const tx = center + (radius * 0.7) * Math.cos((Math.PI * textAngle) / 180);
      const ty = center + (radius * 0.7) * Math.sin((Math.PI * textAngle) / 180);

      const isEmpty = prize.remaining <= 0;
      
      return {
        ...prize,
        pathData,
        tx,
        ty,
        textAngle,
        isEmpty
      };
    });
  }, [prizes, center, radius]);

  const shouldFlash = flash && winner && (winner.id === PrizeLevel.FIRST || winner.id === PrizeLevel.SECOND || winner.id === PrizeLevel.THIRD);

  return (
    <div className="relative flex items-center justify-center p-12 bg-yellow-600/10 rounded-full border-[10px] border-yellow-600 shadow-[0_0_80px_rgba(180,83,9,0.5)] wheel-container">
      {/* Outer Decorative Ring */}
      <div className="absolute inset-0 border-[20px] border-red-800/20 rounded-full pointer-events-none"></div>

      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: isSpinning ? 4 : 0.8, ease: isSpinning ? [0.15, 0, 0.15, 1] : "easeOut" }}
        style={{ width: size, height: size }}
        className="relative shadow-2xl rounded-full overflow-visible"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible drop-shadow-2xl">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="2" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {segments.map((seg) => (
            <g key={seg.id}>
              <path
                d={seg.pathData}
                fill={seg.isEmpty ? '#374151' : seg.color}
                stroke="#92400E"
                strokeWidth="6"
                className="transition-colors duration-500"
              />
              <text
                x={seg.tx}
                y={seg.ty}
                fill="#ffffff"
                fontSize="22"
                fontWeight="900"
                textAnchor="middle"
                transform={`rotate(${seg.textAngle + 90}, ${seg.tx}, ${seg.ty})`}
                className="pointer-events-none drop-shadow-lg font-chinese"
                style={{ 
                  filter: seg.isEmpty ? 'grayscale(100%) brightness(0.5)' : 'none',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {seg.name}
              </text>
            </g>
          ))}
          
          {/* Central Hub with Horse Symbol */}
          <circle cx={center} cy={center} r="45" fill="#7f1d1d" stroke="#facc15" strokeWidth="6" filter="url(#shadow)" />
          <circle cx={center} cy={center} r="35" fill="none" stroke="#facc15" strokeWidth="1" strokeDasharray="4 4" />
          <text 
            x={center} 
            y={center + 18} 
            textAnchor="middle" 
            fill="#fef08a" 
            fontSize="48" 
            className="font-chinese select-none"
            style={{ textShadow: '0 0 10px rgba(250,204,21,0.8)' }}
          >
            馬
          </text>
        </svg>

        {/* Shine Overlay for High Value Prizes */}
        {shouldFlash && (
          <div className="absolute inset-0 bg-yellow-200/40 animate-shine rounded-full pointer-events-none z-10 mix-blend-overlay" />
        )}
      </motion.div>

      {/* Arrow Pointer: Points to the axis from the edge */}
      {/* "箭头顶部指向转动轴，箭头底部在转盘的边上" */}
      <div className="absolute top-0 z-20 flex flex-col items-center -translate-y-4">
        <div className="relative flex flex-col items-center">
           {/* Needle Body */}
           <div className="w-1.5 h-24 bg-gradient-to-t from-red-600 to-yellow-500 shadow-lg rounded-full border border-yellow-200/30"></div>
           {/* Needle Tip (pointing to center) */}
           <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[30px] border-t-red-600 -mt-1 drop-shadow-lg"></div>
           {/* Needle Handle (top edge) */}
           <div className="w-8 h-8 rounded-full bg-yellow-500 border-4 border-red-700 -mt-28 flex items-center justify-center shadow-xl">
              <div className="w-2 h-2 rounded-full bg-red-700"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Wheel;
