import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { StudentProtectedRoute } from "../routes/StudentProtectedRoute";

describe("StudentProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should render protected component when token is valid", () => {
    const mockStudent = {
      id: "stu-123",
      studentId: "STU-2024-001",
      firstName: "John",
      actorType: "STUDENT",
    };

    localStorage.setItem(
      "accessToken_student",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvclR5cGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoic3R1LTEyMyIsInNjaG9vbElkIjoic2NoLTQ1NiIsImlhdCI6MTYzMDcwMzQwMCwiZXhwIjoxNjMwNzg5ODAwfQ.test"
    );

    vi.mock("jwt-decode", () => ({
      jwtDecode: vi.fn(() => ({
        actorType: "STUDENT",
        studentId: "stu-123",
        schoolId: "sch-456",
      })),
    }));

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <BrowserRouter>
        <StudentProtectedRoute>
          <TestComponent />
        </StudentProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to login when token is missing", () => {
    const TestComponent = () => <div>Protected Content</div>;

    render(
      <MemoryRouter initialEntries={["/student/dashboard"]}>
        <StudentProtectedRoute>
          <TestComponent />
        </StudentProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should redirect to login when token is invalid", () => {
    localStorage.setItem("accessToken_student", "invalid-token");

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <MemoryRouter initialEntries={["/student/dashboard"]}>
        <StudentProtectedRoute>
          <TestComponent />
        </StudentProtectedRoute>
      </MemoryRouter>
    );

    expect(localStorage.getItem("accessToken_student")).toBeNull();
  });

  it("should redirect to login when actorType is not STUDENT", () => {
    vi.mock("jwt-decode", () => ({
      jwtDecode: vi.fn(() => ({
        actorType: "USER",
        studentId: "stu-123",
        schoolId: "sch-456",
      })),
    }));

    localStorage.setItem(
      "accessToken_student",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.test"
    );

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <MemoryRouter initialEntries={["/student/dashboard"]}>
        <StudentProtectedRoute>
          <TestComponent />
        </StudentProtectedRoute>
      </MemoryRouter>
    );

    expect(
      screen.queryByText("Protected Content")
    ).not.toBeInTheDocument();
  });

  it("should clear localStorage on invalid token", () => {
    localStorage.setItem("accessToken_student", "invalid-token");
    localStorage.setItem(
      "student",
      JSON.stringify({ id: "stu-123", studentId: "STU-2024-001" })
    );

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <MemoryRouter initialEntries={["/student/dashboard"]}>
        <StudentProtectedRoute>
          <TestComponent />
        </StudentProtectedRoute>
      </MemoryRouter>
    );

    expect(localStorage.getItem("accessToken_student")).toBeNull();
    expect(localStorage.getItem("student")).toBeNull();
  });

  it("should persist token in localStorage after validation", () => {
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvclR5cGUiOiJTVFVERU5UIiwic3R1ZGVudElkIjoic3R1LTEyMyIsInNjaG9vbElkIjoic2NoLTQ1NiIsImlhdCI6MTYzMDcwMzQwMCwiZXhwIjo5OTk5OTk5OTk5fQ.test";

    vi.mock("jwt-decode", () => ({
      jwtDecode: vi.fn(() => ({
        actorType: "STUDENT",
        studentId: "stu-123",
        schoolId: "sch-456",
        exp: 9999999999,
      })),
    }));

    localStorage.setItem("accessToken_student", mockToken);

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <BrowserRouter>
        <StudentProtectedRoute>
          <TestComponent />
        </StudentProtectedRoute>
      </BrowserRouter>
    );

    expect(localStorage.getItem("accessToken_student")).toBe(mockToken);
  });
});
