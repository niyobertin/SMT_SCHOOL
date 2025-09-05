export interface TestQuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'text';
  text: string;
  points: number;
  options?: TestQuestionOption[];
  placeholder?: string;
  explanation?: string;
}

export interface TestDetails {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  instructions: string[];
  passingScore: number;
  totalPoints: number;
  showResults: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestAttemptAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  timeSpent: number; // in seconds
  score?: number;
  passed?: boolean;
  answers: TestAttemptAnswer[];
}

export interface TestResults {
  attempt: TestAttempt;
  test: TestDetails;
  questions: TestQuestion[];
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  percentage: number;
  passed: boolean;
}
