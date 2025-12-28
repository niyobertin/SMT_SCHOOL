import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
    initialTime: number; // in seconds
    onTimeUp: () => void;
}

const ExamTimer = ({ initialTime, onTimeUp }: ExamTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const percentage = (timeLeft / initialTime) * 100;
    const isWarning = timeLeft <= 300; // 5 minutes
    const isCritical = timeLeft <= 60; // 1 minute

    const getTimerColor = () => {
        if (isCritical) return 'from-red-500 to-rose-500';
        if (isWarning) return 'from-yellow-500 to-orange-500';
        return 'from-green-500 to-emerald-500';
    };

    const getBgColor = () => {
        if (isCritical) return 'bg-red-50 border-red-200';
        if (isWarning) return 'bg-yellow-50 border-yellow-200';
        return 'bg-green-50 border-green-200';
    };

    const getTextColor = () => {
        if (isCritical) return 'text-red-700';
        if (isWarning) return 'text-yellow-700';
        return 'text-green-700';
    };

    return (
        <motion.div
            animate={{
                scale: isCritical ? [1, 1.05, 1] : 1,
            }}
            transition={{
                repeat: isCritical ? Infinity : 0,
                duration: 1,
            }}
            className={`px-6 py-3 rounded-xl border-2 ${getBgColor()} transition-all duration-300`}
        >
            <div className="flex items-center gap-3">
                {isWarning && (
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                        <AlertTriangle className={`w-5 h-5 ${getTextColor()}`} />
                    </motion.div>
                )}

                <div className="flex items-center gap-2">
                    {!isWarning && <Clock className={`w-5 h-5 ${getTextColor()}`} />}
                    <div>
                        <p className="text-xs font-medium text-gray-600">Time Remaining</p>
                        <p className={`text-2xl font-bold font-mono ${getTextColor()}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 w-32 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                    className={`bg-gradient-to-r ${getTimerColor()} h-full rounded-full`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </motion.div>
    );
};

export default ExamTimer;
