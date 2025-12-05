
import { Clock, Award, FileText, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{test.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{test.description}</p>

          {/* Test Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{test.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Passing Score</p>
                <p className="text-lg font-semibold text-gray-900">{test.passingScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Instructions
          </h2>
          <ul className="space-y-3">
            {test.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warning Card */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">Important Notice</h3>
              <p className="text-sm text-yellow-700">
                Once you start the test, the timer will begin counting down and cannot be paused.
                Make sure you have a stable internet connection and enough time to complete the test.
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center">
          <button
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
}
