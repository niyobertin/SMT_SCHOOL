import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { studentAuthService } from "../services/studentAuth.service";
import { studentService } from "../services/student.service";
import { schoolService } from "../services/school.service";
import { jest } from "@jest/globals";

const prisma = new PrismaClient();

describe("StudentAuthService", () => {
  let testSchoolId: string;
  let testStudentId: string;

  beforeAll(async () => {
    // Create test school
    const school = await schoolService.createSchool({
      name: "Test School",
      code: "TEST-SCHOOL-001",
      type: "SUBSCRIPTION",
    });
    testSchoolId = school.id;

    // Create test student
    const student = await studentService.createStudent({
      schoolId: school.id,
      studentId: "STU-TEST-001",
      firstName: "John",
      lastName: "Doe",
      credentialHash: "1234",
      email: "john@test.com",
    });
    testStudentId = student.id;
  });

  afterAll(async () => {
    await prisma.student.deleteMany({
      where: { schoolId: testSchoolId },
    });
    await prisma.school.deleteMany({
      where: { code: "TEST-SCHOOL-001" },
    });
    await prisma.$disconnect();
  });

  describe("login", () => {
    it("should successfully login valid student", async () => {
      const result = await studentAuthService.login(
        "TEST-SCHOOL-001",
        "STU-TEST-001",
        "1234"
      );

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("student");
      expect(result).toHaveProperty("expiresIn");
      expect((result as any).student.studentId).toBe("STU-TEST-001");
    });

    it("should fail login with invalid school code", async () => {
      const result = await studentAuthService.login(
        "INVALID-CODE",
        "STU-TEST-001",
        "1234"
      );

      expect(result).toHaveProperty("error");
      expect((result as any).error).toBe("Invalid school code");
    });

    it("should fail login with invalid student ID", async () => {
      const result = await studentAuthService.login(
        "TEST-SCHOOL-001",
        "INVALID-ID",
        "1234"
      );

      expect(result).toHaveProperty("error");
      expect((result as any).error).toContain("Invalid");
    });

    it("should fail login with invalid password", async () => {
      const result = await studentAuthService.login(
        "TEST-SCHOOL-001",
        "STU-TEST-001",
        "wrong-password"
      );

      expect(result).toHaveProperty("error");
      expect((result as any).error).toContain("Invalid");
    });
  });

  describe("token operations", () => {
    it("should generate valid student token", () => {
      const token = studentAuthService.generateStudentToken({
        actorType: "STUDENT",
        studentId: testStudentId,
        schoolId: testSchoolId,
        firstName: "John",
        lastName: "Doe",
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should verify valid student token", () => {
      const token = studentAuthService.generateStudentToken({
        actorType: "STUDENT",
        studentId: testStudentId,
        schoolId: testSchoolId,
        firstName: "John",
        lastName: "Doe",
      });

      const decoded = studentAuthService.verifyStudentToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.studentId).toBe(testStudentId);
      expect(decoded?.actorType).toBe("STUDENT");
    });

    it("should return null for invalid token", () => {
      const result = studentAuthService.verifyStudentToken("invalid-token");
      expect(result).toBeNull();
    });
  });

  describe("getStudentProfile", () => {
    it("should return student profile with enrollments", async () => {
      const profile = await studentAuthService.getStudentProfile(testStudentId);

      expect(profile).toBeDefined();
      expect(profile?.studentId).toBe("STU-TEST-001");
      expect(profile?.firstName).toBe("John");
      expect(profile?.lastName).toBe("Doe");
      expect(profile).toHaveProperty("enrollments");
    });

    it("should return null for non-existent student", async () => {
      const profile = await studentAuthService.getStudentProfile("non-existent");
      expect(profile).toBeNull();
    });
  });
});
