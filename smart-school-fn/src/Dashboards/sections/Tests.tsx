import React from 'react';
import TestQuestionManager from './TestQuestionManager';
export const Tests: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Management</h1>
      <TestQuestionManager />
    </div>
  );
};

export default Tests;
