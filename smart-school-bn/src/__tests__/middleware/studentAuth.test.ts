import { describe, it, expect, beforeAll } from "@jest/globals";
import { studentAuthService } from "../services/studentAuth.service";
import { authenticateStudent, requireStudentSchoolScope } from "../middleware/studentAuth";
import { Request, Response, NextFunction } from "express";

describe("Student Auth Middleware", () => {
  describe("authenticateStudent", () => {
    it("should reject missing token", async () => {
      const req = {
        header: () => undefined,
      } as any as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).toBe(401);
            expect(data.message).toContain("token");
          },
        }),
      } as any as Response;

      await authenticateStudent(req, res, () => {});
    });

    it("should accept valid student token", async () => {
      const payload = {
        actorType: "STUDENT",
        studentId: "stu-123",
        schoolId: "sch-456",
        firstName: "John",
        lastName: "Doe",
      };

      const token = studentAuthService.generateStudentToken(payload);

      let nextCalled = false;
      const req = {
        header: (key: string) => {
          return key === "Authorization" ? `Bearer ${token}` : undefined;
        },
      } as any as Request;

      const res = {} as any as Response;
      const next = () => {
        nextCalled = true;
      };

      await authenticateStudent(req, res, next);

      expect(nextCalled).toBe(true);
      expect((req as any).student).toBeDefined();
      expect((req as any).studentId).toBe("stu-123");
      expect((req as any).schoolId).toBe("sch-456");
    });

    it("should reject invalid token", async () => {
      const req = {
        header: (key: string) =>
          key === "Authorization" ? "Bearer invalid-token" : undefined,
      } as any as Request;

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).toBe(401);
          },
        }),
      } as any as Response;

      await authenticateStudent(req, res, () => {});
    });
  });

  describe("requireStudentSchoolScope", () => {
    it("should allow access to own school", () => {
      const middleware = requireStudentSchoolScope("schoolId");

      const req = {
        params: { schoolId: "sch-456" },
      } as any as Request;

      (req as any).student = {
        studentId: "stu-123",
        schoolId: "sch-456",
      };

      const res = {} as any as Response;
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      middleware(req, res, next);

      expect(nextCalled).toBe(true);
    });

    it("should deny access to other schools", () => {
      const middleware = requireStudentSchoolScope("schoolId");

      const req = {
        params: { schoolId: "sch-different" },
      } as any as Request;

      (req as any).student = {
        studentId: "stu-123",
        schoolId: "sch-456",
      };

      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            expect(code).toBe(403);
            expect(data.message).toContain("cannot access other");
          },
        }),
      } as any as Response;

      const next = () => {};

      middleware(req, res, next);
    });
  });
});
