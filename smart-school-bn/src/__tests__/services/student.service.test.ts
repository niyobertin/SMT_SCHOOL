import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { studentService } from "../services/student.service";
import { schoolService } from "../services/school.service";

const prisma = new PrismaClient();

describe("StudentService", () => {
  let testSchoolId: string;
  let testStudentId: string;

  beforeAll(async () => {
    const school = await schoolService.createSchool({
      name: "Integration Test School",
      code: "INTEG-SCHOOL-001",
      type: "SUBSCRIPTION",
    });
    testSchoolId = school.id;
  });

  afterAll(async () => {
    await prisma.student.deleteMany({
      where: { schoolId: testSchoolId },
    });
    await prisma.school.deleteMany({
      where: { id: testSchoolId },
    });
    await prisma.$disconnect();
  });

  describe("createStudent", () => {
    it("should create a new student", async () => {
      const student = await studentService.createStudent({
        schoolId: testSchoolId,
        studentId: "STU-INTEG-001",
        firstName: "Jane",
        lastName: "Smith",
        credentialHash: "password123",
        email: "jane@test.com",
      });

      testStudentId = student.id;

      expect(student).toBeDefined();
      expect(student.studentId).toBe("STU-INTEG-001");
      expect(student.firstName).toBe("Jane");
    });

    it("should hash credential on creation", async () => {
      const student = await studentService.createStudent({
        schoolId: testSchoolId,
        studentId: "STU-INTEG-002",
        firstName: "Bob",
        lastName: "Johnson",
        credentialHash: "test123",
        email: "bob@test.com",
      });

      expect(student.credentialHash).not.toBe("test123");
    });
  });

  describe("getStudentBySchoolAndId", () => {
    it("should retrieve student by school and ID", async () => {
      const student = await studentService.getStudentBySchoolAndId(
        testSchoolId,
        "STU-INTEG-001"
      );

      expect(student).toBeDefined();
      expect(student?.studentId).toBe("STU-INTEG-001");
    });

    it("should return null for non-existent student", async () => {
      const student = await studentService.getStudentBySchoolAndId(
        testSchoolId,
        "NON-EXISTENT"
      );

      expect(student).toBeNull();
    });
  });

  describe("listStudentsBySchool", () => {
    it("should list students with pagination", async () => {
      const result = await studentService.listStudentsBySchool(
        testSchoolId,
        1,
        10
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("pagination");
      expect(result.pagination.page).toBe(1);
    });
  });

  describe("verifyStudentCredential", () => {
    it("should verify correct password", async () => {
      const student = await studentService.getStudentById(testStudentId);
      if (!student) throw new Error("Student not found");

      const verified = await studentService.verifyStudentCredential(
        student.id,
        "password123"
      );

      expect(verified).toBeDefined();
      expect(verified?.studentId).toBe("STU-INTEG-001");
    });

    it("should reject incorrect password", async () => {
      const student = await studentService.getStudentById(testStudentId);
      if (!student) throw new Error("Student not found");

      const verified = await studentService.verifyStudentCredential(
        student.id,
        "wrong-password"
      );

      expect(verified).toBeNull();
    });
  });

  describe("updateStudentStatus", () => {
    it("should update student status", async () => {
      const student = await studentService.updateStudentStatus(
        testStudentId,
        "INACTIVE"
      );

      expect(student.status).toBe("INACTIVE");

      await studentService.updateStudentStatus(
        testStudentId,
        "ACTIVE"
      );
    });
  });
});
