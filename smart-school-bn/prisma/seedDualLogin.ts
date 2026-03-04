import { PrismaClient, SchoolType, UserRole, SchoolRoleType, CourseLevel, CourseStatus, StudentStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  try {
    // 1. Create test schools
    const school1 = await prisma.school.upsert({
      where: { code: "PS-2024" },
      update: {},
      create: {
        name: "Primary School District",
        code: "PS-2024",
        contactEmail: "admin@primaryschool.edu",
        contactPhone: "+1-555-0101",
        description: "Primary School District",
        isActive: true,
        type: SchoolType.SUBSCRIPTION,
      },
    });

    const school2 = await prisma.school.upsert({
      where: { code: "HS-2024" },
      update: {},
      create: {
        name: "High School Academy",
        code: "HS-2024",
        contactEmail: "admin@highschoolacademy.edu",
        contactPhone: "+1-555-0102",
        description: "High School Academy",
        isActive: true,
        type: SchoolType.SUBSCRIPTION,
      },
    });

    console.log("✓ Schools created");

    // 2. Create academic years
    const academicYear2024 = await prisma.academicYear.upsert({
      where: {
        schoolId_year: {
          schoolId: school1.id,
          year: "2024",
        },
      },
      update: {},
      create: {
        schoolId: school1.id,
        year: "2024",
        startDate: new Date("2024-01-08"),
        endDate: new Date("2024-12-20"),
        isActive: true,
      },
    });

    const academicYear2024_hs = await prisma.academicYear.upsert({
      where: {
        schoolId_year: {
          schoolId: school2.id,
          year: "2024",
        },
      },
      update: {},
      create: {
        schoolId: school2.id,
        year: "2024",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-12-15"),
        isActive: true,
      },
    });

    console.log("✓ Academic years created");

    // 3. Create school classes
    const class1A = await prisma.schoolClass.upsert({
      where: {
        schoolId_name: {
          schoolId: school1.id,
          name: "Grade 4-A",
        },
      },
      update: {},
      create: {
        schoolId: school1.id,
        name: "Grade 4-A",
        academicYearId: academicYear2024.id,
      },
    });

    const class1B = await prisma.schoolClass.upsert({
      where: {
        schoolId_name: {
          schoolId: school1.id,
          name: "Grade 4-B",
        },
      },
      update: {},
      create: {
        schoolId: school1.id,
        name: "Grade 4-B",
        academicYearId: academicYear2024.id,
      },
    });

    const class2A = await prisma.schoolClass.upsert({
      where: {
        schoolId_name: {
          schoolId: school2.id,
          name: "Grade 9-A",
        },
      },
      update: {},
      create: {
        schoolId: school2.id,
        name: "Grade 9-A",
        academicYearId: academicYear2024_hs.id,
      },
    });

    console.log("✓ School classes created");

    // 4. Create students
    const hashedPin = await bcrypt.hash("1234", 10);

    const student1 = await prisma.student.upsert({
      where: {
        schoolId_studentId: {
          schoolId: school1.id,
          studentId: "STU-2024-001",
        },
      },
      update: {},
      create: {
        schoolId: school1.id,
        studentId: "STU-2024-001",
        firstName: "Emma",
        lastName: "Smith",
        email: "emma.smith@primaryschool.edu",
        dateOfBirth: new Date("2015-03-15"),
        gender: "F",
        credentialHash: hashedPin,
        status: StudentStatus.ACTIVE,
        classId: class1A.id,
        academicYearId: academicYear2024.id,
      },
    });

    const student2 = await prisma.student.upsert({
      where: {
        schoolId_studentId: {
          schoolId: school1.id,
          studentId: "STU-2024-002",
        },
      },
      update: {},
      create: {
        schoolId: school1.id,
        studentId: "STU-2024-002",
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@primaryschool.edu",
        dateOfBirth: new Date("2015-07-22"),
        gender: "M",
        credentialHash: hashedPin,
        status: StudentStatus.ACTIVE,
        classId: class1A.id,
        academicYearId: academicYear2024.id,
      },
    });

    const student3 = await prisma.student.upsert({
      where: {
        schoolId_studentId: {
          schoolId: school1.id,
          studentId: "STU-2024-003",
        },
      },
      update: {},
      create: {
        schoolId: school1.id,
        studentId: "STU-2024-003",
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@primaryschool.edu",
        dateOfBirth: new Date("2015-11-08"),
        gender: "F",
        credentialHash: hashedPin,
        status: StudentStatus.ACTIVE,
        classId: class1B.id,
        academicYearId: academicYear2024.id,
      },
    });

    const student4 = await prisma.student.upsert({
      where: {
        schoolId_studentId: {
          schoolId: school2.id,
          studentId: "STU-2024-101",
        },
      },
      update: {},
      create: {
        schoolId: school2.id,
        studentId: "STU-2024-101",
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@highschoolacademy.edu",
        dateOfBirth: new Date("2008-05-30"),
        gender: "M",
        credentialHash: hashedPin,
        status: StudentStatus.ACTIVE,
        classId: class2A.id,
        academicYearId: academicYear2024_hs.id,
      },
    });

    console.log("✓ Students created");

    // 5. Create staff users
    const staffUser1 = await prisma.user.upsert({
      where: { email: "teacher1@primaryschool.edu" },
      update: {},
      create: {
        email: "teacher1@primaryschool.edu",
        username: "teacher1_ps",
        phoneNumber: "+1-555-1001",
        firstName: "James",
        lastName: "Mitchell",
        role: UserRole.INSTRUCTOR,
        password: await bcrypt.hash("TeacherPass123!", 10),
        isVerified: true,
      },
    });

    const staffUser2 = await prisma.user.upsert({
      where: { email: "admin.staff@highschoolacademy.edu" },
      update: {},
      create: {
        email: "admin.staff@highschoolacademy.edu",
        username: "admin_hs",
        phoneNumber: "+1-555-1002",
        firstName: "Lisa",
        lastName: "Anderson",
        role: UserRole.ADMIN,
        password: await bcrypt.hash("AdminPass123!", 10),
        isVerified: true,
      },
    });

    await prisma.schoolStaff.upsert({
      where: {
        schoolId_userId: {
          schoolId: school1.id,
          userId: staffUser1.id,
        },
      },
      update: {},
      create: {
        schoolId: school1.id,
        userId: staffUser1.id,
        roleInSchool: SchoolRoleType.TEACHER,
      },
    });

    await prisma.schoolStaff.upsert({
      where: {
        schoolId_userId: {
          schoolId: school2.id,
          userId: staffUser2.id,
        },
      },
      update: {},
      create: {
        schoolId: school2.id,
        userId: staffUser2.id,
        roleInSchool: SchoolRoleType.SCHOOL_ADMIN,
      },
    });

    console.log("✓ School staff created");

    // 6. Create Category
    const category = await prisma.category.upsert({
      where: { slug: "general-education" },
      update: {},
      create: {
        name: "General Education",
        slug: "general-education",
        description: "General school subjects",
      },
    });

    // 7. Create school-specific courses
    const course1 = await prisma.course.upsert({
      where: { slug: "math-grade-4" },
      update: {},
      create: {
        title: "Mathematics Fundamentals Grade 4",
        slug: "math-grade-4",
        description: "Basic math concepts for Grade 4 students",
        schoolId: school1.id,
        level: CourseLevel.BEGINNER,
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        instructorId: staffUser1.id,
        categoryId: category.id,
      },
    });

    const course2 = await prisma.course.upsert({
      where: { slug: "english-grade-4" },
      update: {},
      create: {
        title: "English Language Arts Grade 4",
        slug: "english-grade-4",
        description: "Reading, writing, and grammar for Grade 4",
        schoolId: school1.id,
        level: CourseLevel.BEGINNER,
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        instructorId: staffUser1.id,
        categoryId: category.id,
      },
    });

    const course3 = await prisma.course.upsert({
      where: { slug: "biology-grade-9" },
      update: {},
      create: {
        title: "Biology Grade 9",
        slug: "biology-grade-9",
        description: "Introduction to life sciences",
        schoolId: school2.id,
        level: CourseLevel.INTERMEDIATE,
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        instructorId: staffUser2.id,
        categoryId: category.id,
      },
    });

    console.log("✓ School-specific courses created");

    // 8. Enroll students in courses
    await prisma.studentEnrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student1.id,
          courseId: course1.id,
        },
      },
      update: {},
      create: {
        studentId: student1.id,
        courseId: course1.id,
        progress: 15,
        isCompleted: false,
      },
    });

    await prisma.studentEnrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student1.id,
          courseId: course2.id,
        },
      },
      update: {},
      create: {
        studentId: student1.id,
        courseId: course2.id,
        progress: 20,
        isCompleted: false,
      },
    });

    await prisma.studentEnrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student2.id,
          courseId: course1.id,
        },
      },
      update: {},
      create: {
        studentId: student2.id,
        courseId: course1.id,
        progress: 25,
        isCompleted: false,
      },
    });

    await prisma.studentEnrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student4.id,
          courseId: course3.id,
        },
      },
      update: {},
      create: {
        studentId: student4.id,
        courseId: course3.id,
        progress: 30,
        isCompleted: false,
      },
    });

    console.log("✓ Student enrollments created");

    console.log("✅ Database seed completed successfully!");
    console.log("\n📚 Test Data Summary:");
    console.log(`  - Schools: 2 (PS-2024, HS-2024)`);
    console.log(`  - Students: 4`);
    console.log(`  - Courses: 3`);
    console.log(`  - Enrollments: 4`);
    console.log(`\n🔐 Credentials for Testing:`);
    console.log(`  School Code: PS-2024 | Student ID: STU-2024-001 | PIN: 1234`);
    console.log(`  School Code: PS-2024 | Student ID: STU-2024-002 | PIN: 1234`);
    console.log(`  School Code: PS-2024 | Student ID: STU-2024-003 | PIN: 1234`);
    console.log(`  School Code: HS-2024 | Student ID: STU-2024-101 | PIN: 1234`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
