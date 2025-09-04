import { useState, useEffect } from "react"
import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw } from "lucide-react"

// Mock quiz data
const mockQuiz = {
  id: 1,
  title: "React Hooks Assessment",
  course: "React Fundamentals",
  duration: 30,
  totalQuestions: 5,
  questions: [
    {
      id: 1,
      question: "What is the primary purpose of the useState hook in React?",
      options: ["To manage component lifecycle", "To handle side effects", "To manage local component state", "To optimize performance"],
      correctAnswer: 2,
      explanation: "useState is used to add state to functional components, allowing them to store and update local state values.",
    },
    {
      id: 2,
      question: "Which hook would you use to perform side effects in a functional component?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correctAnswer: 1,
      explanation: "useEffect is the hook designed for handling side effects like API calls, subscriptions, and DOM manipulation.",
    },
    {
      id: 3,
      question: "What does the dependency array in useEffect control?",
      options: ["The return value of the effect", "When the effect should run", "The cleanup function", "The component's render cycle"],
      correctAnswer: 1,
      explanation: "The dependency array determines when useEffect should re-run. It runs when any dependency changes.",
    },
  ],
}

type QuizState = "taking" | "completed" | "reviewing"

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [timeRemaining, setTimeRemaining] = useState(mockQuiz.duration * 60)
  const [quizState, setQuizState] = useState<QuizState>("taking")
  const [score, setScore] = useState(0)

  // Timer
  useEffect(() => {
    if (quizState !== "taking" || timeRemaining <= 0) return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setQuizState("completed")
          calculateScore()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [quizState, timeRemaining])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (qIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }))
  }

  const calculateScore = () => {
    let correct = 0
    mockQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++
    })
    setScore(correct)
  }

  const handleSubmitQuiz = () => {
    calculateScore()
    setQuizState("completed")
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setTimeRemaining(mockQuiz.duration * 60)
    setQuizState("taking")
    setScore(0)
  }

  const progress = ((currentQuestion + 1) / mockQuiz.questions.length) * 100

  // ================== QUIZ RESULTS ==================
  if (quizState === "completed") {
    const percentage = Math.round((score / mockQuiz.questions.length) * 100)
    const passed = percentage >= 70
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white shadow rounded-lg p-8 w-full max-w-lg text-center">
          <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-full mb-6 ${passed ? "bg-green-100" : "bg-red-100"}`}>
            {passed ? <CheckCircle className="text-green-600 w-10 h-10" /> : <XCircle className="text-red-600 w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">{passed ? "Congratulations!" : "Quiz Completed"}</h2>
          <p className="text-gray-600 mb-6">{passed ? "You’ve successfully passed!" : "You can retake the quiz."}</p>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-2xl font-bold">{score}</div>
              <p className="text-sm text-gray-500">Correct</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{percentage}%</div>
              <p className="text-sm text-gray-500">Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{mockQuiz.questions.length}</div>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setQuizState("reviewing")} className="border px-4 py-2 rounded-md">Review Answers</button>
            <button onClick={handleRetakeQuiz} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
              <RotateCcw className="w-4 h-4" /> Retake
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ================== QUIZ REVIEW ==================
  if (quizState === "reviewing") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {mockQuiz.questions.map((q, i) => {
            const userAnswer = answers[i]
            const isCorrect = userAnswer === q.correctAnswer
            return (
              <div key={q.id} className={`p-6 bg-white rounded-lg shadow border-l-4 ${isCorrect ? "border-green-500" : "border-red-500"}`}>
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold">Question {i + 1}</h3>
                  <span className={`text-sm font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <p className="mb-4">{q.question}</p>
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, idx) => {
                    const isUser = userAnswer === idx
                    const isRight = q.correctAnswer === idx
                    return (
                      <div key={idx} className={`p-2 rounded border ${isRight ? "border-green-500 bg-green-50" : isUser ? "border-red-500 bg-red-50" : "border-gray-200"}`}>
                        {opt}
                      </div>
                    )
                  })}
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-medium text-blue-900">Explanation</p>
                  <p className="text-blue-800">{q.explanation}</p>
                </div>
              </div>
            )
          })}
          <button onClick={() => setQuizState("completed")} className="mt-6 px-4 py-2 rounded bg-gray-800 text-white">Back to Results</button>
        </div>
      </div>
    )
  }

  // ================== QUIZ TAKING ==================
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <div>
            <h1 className="font-bold">{mockQuiz.title}</h1>
            <p className="text-sm text-gray-600">{mockQuiz.course}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span className={timeRemaining < 300 ? "text-red-600 font-bold" : "text-gray-800"}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-1 text-sm">
            <span>Question {currentQuestion + 1} of {mockQuiz.questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="font-semibold mb-4">{mockQuiz.questions[currentQuestion].question}</p>
          <div className="space-y-3">
            {mockQuiz.questions[currentQuestion].options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={`q-${currentQuestion}`}
                  checked={answers[currentQuestion] === idx}
                  onChange={() => handleAnswerSelect(currentQuestion, idx)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded border disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" /> Previous
          </button>

          {currentQuestion === mockQuiz.questions.length - 1 ? (
            <button onClick={handleSubmitQuiz} className="px-4 py-2 bg-green-600 text-white rounded">
              Submit Quiz
            </button>
          ) : (
            <button onClick={() => setCurrentQuestion((prev) => Math.min(mockQuiz.questions.length - 1, prev + 1))} className="px-4 py-2 bg-blue-600 text-white rounded">
              Next <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
