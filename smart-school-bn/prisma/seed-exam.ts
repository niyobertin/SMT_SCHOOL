import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding examination system...');

    // Create 3 Organizations
    const organizations = await Promise.all([
        prisma.organization.create({
            data: {
                name: 'Tech University',
                description: 'Leading technology education institution',
                logo: 'https://via.placeholder.com/150?text=Tech+Uni',
                contactEmail: 'admin@techuni.edu',
                contactPhone: '+250788000001',
            },
        }),
        prisma.organization.create({
            data: {
                name: 'Business School Rwanda',
                description: 'Premier business education center',
                logo: 'https://via.placeholder.com/150?text=Business+School',
                contactEmail: 'info@businessrw.edu',
                contactPhone: '+250788000002',
            },
        }),
        prisma.organization.create({
            data: {
                name: 'Medical Institute',
                description: 'Advanced healthcare education',
                logo: 'https://via.placeholder.com/150?text=Medical+Institute',
                contactEmail: 'contact@medicalinst.edu',
                contactPhone: '+250788000003',
            },
        }),
    ]);

    console.log('✅ Created 3 organizations');

    // Create 3 Candidates for each organization (9 total)
    const candidates = [];
    for (const org of organizations) {
        const orgCandidates = await Promise.all([
            prisma.candidate.create({
                data: {
                    candidateId: `CAND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    firstName: 'John',
                    lastName: 'Doe',
                    email: `john.doe@${org.name.toLowerCase().replace(/\s/g, '')}.com`,
                    phoneNumber: '+250788111001',
                    organizationId: org.id,
                },
            }),
            prisma.candidate.create({
                data: {
                    candidateId: `CAND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: `jane.smith@${org.name.toLowerCase().replace(/\s/g, '')}.com`,
                    phoneNumber: '+250788111002',
                    organizationId: org.id,
                },
            }),
            prisma.candidate.create({
                data: {
                    candidateId: `CAND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    firstName: 'Michael',
                    lastName: 'Johnson',
                    email: `michael.j@${org.name.toLowerCase().replace(/\s/g, '')}.com`,
                    phoneNumber: '+250788111003',
                    organizationId: org.id,
                },
            }),
        ]);
        candidates.push(...orgCandidates);
    }

    console.log('✅ Created 9 candidates (3 per organization)');

    // Create 3 Exams for each organization
    const exams = [];
    const examData = [
        {
            title: 'Introduction to Programming',
            description: 'Test your basic programming knowledge',
            duration: 45,
            passingScore: 70,
            questions: [
                {
                    question: 'What does HTML stand for?',
                    type: 'MULTIPLE_CHOICE',
                    points: 1,
                    explanation: 'HTML stands for HyperText Markup Language',
                    options: [
                        { option: 'Hyper Text Markup Language', isCorrect: true },
                        { option: 'High Tech Modern Language', isCorrect: false },
                        { option: 'Home Tool Markup Language', isCorrect: false },
                        { option: 'Hyperlinks and Text Markup Language', isCorrect: false },
                    ],
                },
                {
                    question: 'Which programming language is known as the "language of the web"?',
                    type: 'MULTIPLE_CHOICE',
                    points: 1,
                    explanation: 'JavaScript is the primary language for web development',
                    options: [
                        { option: 'Python', isCorrect: false },
                        { option: 'JavaScript', isCorrect: true },
                        { option: 'Java', isCorrect: false },
                        { option: 'C++', isCorrect: false },
                    ],
                },
                {
                    question: 'What is a variable in programming?',
                    type: 'SHORT_ANSWER',
                    points: 2,
                    explanation: 'A variable is a container for storing data values',
                    options: [],
                },
                {
                    question: 'Is Python a compiled language?',
                    type: 'TRUE_FALSE',
                    points: 1,
                    explanation: 'Python is an interpreted language, not compiled',
                    options: [
                        { option: 'True', isCorrect: false },
                        { option: 'False', isCorrect: true },
                    ],
                },
                {
                    question: 'What does CSS stand for?',
                    type: 'MULTIPLE_CHOICE',
                    points: 1,
                    explanation: 'CSS stands for Cascading Style Sheets',
                    options: [
                        { option: 'Computer Style Sheets', isCorrect: false },
                        { option: 'Cascading Style Sheets', isCorrect: true },
                        { option: 'Creative Style System', isCorrect: false },
                        { option: 'Colorful Style Sheets', isCorrect: false },
                    ],
                },
            ],
        },
        {
            title: 'Database Fundamentals',
            description: 'Assessment of database concepts and SQL',
            duration: 60,
            passingScore: 75,
            questions: [
                {
                    question: 'What does SQL stand for?',
                    type: 'MULTIPLE_CHOICE',
                    points: 1,
                    explanation: 'SQL stands for Structured Query Language',
                    options: [
                        { option: 'Structured Query Language', isCorrect: true },
                        { option: 'Simple Question Language', isCorrect: false },
                        { option: 'Standard Question List', isCorrect: false },
                        { option: 'System Query Log', isCorrect: false },
                    ],
                },
                {
                    question: 'Which SQL command is used to retrieve data from a database?',
                    type: 'MULTIPLE_CHOICE',
                    points: 1,
                    explanation: 'SELECT is used to query and retrieve data',
                    options: [
                        { option: 'GET', isCorrect: false },
                        { option: 'FETCH', isCorrect: false },
                        { option: 'SELECT', isCorrect: true },
                        { option: 'RETRIEVE', isCorrect: false },
                    ],
                },
                {
                    question: 'What is a primary key?',
                    type: 'SHORT_ANSWER',
                    points: 2,
                    explanation: 'A primary key uniquely identifies each record in a table',
                    options: [],
                },
                {
                    question: 'Can a table have multiple primary keys?',
                    type: 'TRUE_FALSE',
                    points: 1,
                    explanation: 'A table can only have one primary key',
                    options: [
                        { option: 'True', isCorrect: false },
                        { option: 'False', isCorrect: true },
                    ],
                },
                {
                    question: 'What is normalization in databases?',
                    type: 'MULTIPLE_CHOICE',
                    points: 2,
                    explanation: 'Normalization organizes data to reduce redundancy',
                    options: [
                        { option: 'Making data normal', isCorrect: false },
                        { option: 'Organizing data to reduce redundancy', isCorrect: true },
                        { option: 'Backing up the database', isCorrect: false },
                        { option: 'Encrypting database content', isCorrect: false },
                    ],
                },
            ],
        },
        {
            title: 'Mathematics Aptitude Test',
            description: 'Test your mathematical reasoning skills',
            duration: 30,
            passingScore: 80,
            questions: [
                {
                    question: 'What is 15 + 27?',
                    type: 'MULTIPLE_CHOICE',
                    points: 1,
                    explanation: 'Simple addition: 15 + 27 = 42',
                    options: [
                        { option: '40', isCorrect: false },
                        { option: '42', isCorrect: true },
                        { option: '43', isCorrect: false },
                        { option: '45', isCorrect: false },
                    ],
                },
                {
                    question: 'What is the square root of 144?',
                    type: 'MULTIPLE_CHOICE',
                    points: 1,
                    explanation: '12 × 12 = 144',
                    options: [
                        { option: '10', isCorrect: false },
                        { option: '11', isCorrect: false },
                        { option: '12', isCorrect: true },
                        { option: '14', isCorrect: false },
                    ],
                },
                {
                    question: 'Is 17 a prime number?',
                    type: 'TRUE_FALSE',
                    points: 1,
                    explanation: '17 is only divisible by 1 and itself',
                    options: [
                        { option: 'True', isCorrect: true },
                        { option: 'False', isCorrect: false },
                    ],
                },
                {
                    question: 'What is the value of π (pi) to 2 decimal places?',
                    type: 'MULTIPLE_CHOICE',
                    points: 1,
                    explanation: 'π ≈ 3.14',
                    options: [
                        { option: '3.12', isCorrect: false },
                        { option: '3.14', isCorrect: true },
                        { option: '3.16', isCorrect: false },
                        { option: '3.18', isCorrect: false },
                    ],
                },
                {
                    question: 'Solve for x: 2x + 5 = 15',
                    type: 'MULTIPLE_CHOICE',
                    points: 2,
                    explanation: '2x = 10, therefore x = 5',
                    options: [
                        { option: '3', isCorrect: false },
                        { option: '5', isCorrect: true },
                        { option: '7', isCorrect: false },
                        { option: '10', isCorrect: false },
                    ],
                },
            ],
        },
    ];

    for (let i = 0; i < organizations.length; i++) {
        const org = organizations[i];

        for (const examTemplate of examData) {
            const examCode = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;

            const exam = await prisma.exam.create({
                data: {
                    title: examTemplate.title,
                    description: examTemplate.description,
                    instructions: [
                        'Read each question carefully',
                        'Select the best answer for multiple choice questions',
                        'You can navigate between questions',
                        'Make sure to submit your exam before time runs out',
                    ],
                    duration: examTemplate.duration,
                    passingScore: examTemplate.passingScore,
                    examCode,
                    status: 'PUBLISHED',
                    randomizeQuestions: true,
                    showResults: true,
                    allowReview: true,
                    organizationId: org.id,
                },
            });

            // Create questions for the exam
            for (let j = 0; j < examTemplate.questions.length; j++) {
                const q = examTemplate.questions[j];

                const question = await prisma.examQuestion.create({
                    data: {
                        question: q.question,
                        type: q.type as any,
                        points: q.points,
                        explanation: q.explanation,
                        order: j,
                        examId: exam.id,
                    },
                });

                // Create options for the question
                if (q.options.length > 0) {
                    await Promise.all(
                        q.options.map((opt, index) =>
                            prisma.examQuestionOption.create({
                                data: {
                                    option: opt.option,
                                    isCorrect: opt.isCorrect,
                                    order: index,
                                    examQuestionId: question.id,
                                },
                            })
                        )
                    );
                }
            }

            exams.push(exam);
        }
    }

    console.log('✅ Created 9 exams (3 per organization) with questions');

    // Assign exams to candidates
    let assignmentCount = 0;
    for (let i = 0; i < organizations.length; i++) {
        const org = organizations[i];
        const orgCandidates = candidates.filter(c => c.organizationId === org.id);
        const orgExams = exams.filter(e => e.organizationId === org.id);

        for (const candidate of orgCandidates) {
            for (const exam of orgExams) {
                await prisma.examAssignment.create({
                    data: {
                        candidateId: candidate.id,
                        examId: exam.id,
                    },
                });
                assignmentCount++;
            }
        }
    }

    console.log(`✅ Created ${assignmentCount} exam assignments`);

    // Print summary with credentials
    console.log('\n📋 SEED DATA SUMMARY:');
    console.log('='.repeat(50));

    for (let i = 0; i < organizations.length; i++) {
        const org = organizations[i];
        const orgCandidates = candidates.filter(c => c.organizationId === org.id);
        const orgExams = exams.filter(e => e.organizationId === org.id);

        console.log(`\n🏢 ${org.name}`);
        console.log('-'.repeat(50));

        console.log('\n👥 Candidates:');
        orgCandidates.forEach(c => {
            console.log(`   • ${c.firstName} ${c.lastName}`);
            console.log(`     ID: ${c.candidateId}`);
            console.log(`     Email: ${c.email}`);
        });

        console.log('\n📝 Exams:');
        orgExams.forEach(e => {
            console.log(`   • ${e.title}`);
            console.log(`     Code: ${e.examCode}`);
            console.log(`     Duration: ${e.duration} min | Passing: ${e.passingScore}%`);
        });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Seeding completed successfully!');
    console.log('\n🚀 To test the exam portal:');
    console.log('   1. Navigate to: http://localhost:5173/exam-portal/login');
    console.log('   2. Use any Candidate ID and Exam Code from above');
    console.log('   3. Take the exam and view results!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
