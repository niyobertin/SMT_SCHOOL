
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
      <p className="text-gray-600 mb-6">{test.description}</p>
          
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <List className="h-5 w-5 mr-2 text-blue-600" /> Instructions
        </h2>
        <ul className="space-y-2 pl-6 list-disc">
          {test.instructions.map((instruction, index) => (
            <li key={index} className="text-gray-700">
              {instruction}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Once you start the test, the timer will begin and you won't be able to pause it.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Start Test
        </button>
      </div>
    </div>
  );
}
