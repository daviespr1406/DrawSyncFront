import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
}

export function Timer({ timeLeft }: TimerProps) {
  const [time, setTime] = useState(timeLeft);

  useEffect(() => {
    setTime(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const percentage = (time / 60) * 100;
  const isLowTime = time <= 10;

  return (
    <div className="relative">
      {/* Circular timer */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="#fed7aa"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke={isLowTime ? '#ef4444' : 'url(#gradient)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 58}`}
            strokeDashoffset={`${2 * Math.PI * 58 * (1 - percentage / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock className={`w-6 h-6 mb-1 ${isLowTime ? 'text-red-500' : 'text-orange-500'}`} />
          <div className={`text-3xl ${isLowTime ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
            {time}
          </div>
          <div className="text-xs text-gray-600">segundos</div>
        </div>
      </div>
    </div>
  );
}
