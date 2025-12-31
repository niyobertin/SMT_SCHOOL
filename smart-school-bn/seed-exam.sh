#!/bin/bash

echo "🌱 Seeding Examination System Database..."
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# Run the seed script
npx ts-node prisma/seed-exam.ts

echo ""
echo "✅ Seeding complete!"
echo ""
echo "📋 Quick Test Instructions:"
echo "1. Start backend: npm run dev"
echo "2. Start frontend: cd ../smart-school-fn && npm run dev"
echo "3. Visit: http://localhost:5173/exam-portal/login"
echo "4. Use any Candidate ID and Exam Code from the output above"
echo ""
