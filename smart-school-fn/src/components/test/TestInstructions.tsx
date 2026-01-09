
import { List, AlertCircle } from 'lucide-react';

export interface TestInstructionsProps {
  test: {
    title: string;
    description: string;
    instructions: string[];
    duration: number;
    passingScore: number;
  };
  onStart: () => void;
}

export function TestInstructions({ test, onStart }: TestInstructionsProps) {
  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-white rounded-3xl shadow-xl shadow-blue-50/50 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600 w-1.5 h-8 rounded-full" />
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{test.title}</h1>
      </div>
      <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{test.description}</p>

      <div className="mb-10">
        <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center">
          <List className="h-4 w-4 mr-2" /> Important Instructions
        </h2>
        <ul className="space-y-4">
          {test.instructions.map((instruction, index) => (
            <li key={index} className="flex items-start group">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {index + 1}
              </div>
              <span className="text-gray-600 font-medium leading-relaxed">{instruction}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 mb-10">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-1">Attention Required</p>
            <p className="text-sm text-orange-700 font-medium leading-relaxed">
              Once you start the examination, the timer will begin immediately and cannot be paused. Ensure you have a stable connection.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onStart}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
        >
          START EXAMINATION
        </button>
      </div>
    </div>
  );
}
