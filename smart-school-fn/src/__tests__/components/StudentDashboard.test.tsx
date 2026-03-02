import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { StudentDashboard } from "../pages/student/StudentDashboard";
import * as axios from "axios";

vi.mock("axios");

describe("StudentDashboard", () => {
  const mockStudent = {
    id: "stu-123",
    studentId: "STU-2024-001",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    schoolId: "sch-456",
    schoolName: "Test School",
    enrollments: [
      {
        id: "enr-1",
        courseId: "crs-1",
        enrolledAt: "2024-01-01",
        course: {
          id: "crs-1",
          title: "Mathematics Basics",
          description: "Learn basic math",
          thumbnail: "https://example.com/math.jpg",
        },
      },
      {
        id: "enr-2",
        courseId: "crs-2",
        enrolledAt: "2024-01-15",
        course: {
          id: "crs-2",
          title: "English Literature",
          description: "Explore great works",
          thumbnail: "https://example.com/english.jpg",
        },
      },
    ],
    progressCount: 15,
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("accessToken_student", "test-token");
    localStorage.setItem("student", JSON.stringify(mockStudent));
    vi.clearAllMocks();
  });

  it("should display student dashboard with loading state", () => {
    const mockAxios = axios as any;
    mockAxios.get = vi.fn(
      () =>
        new Promise(() => {
          /* never resolves to keep loading */
        })
    );

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and display student profile", async () => {
    const mockAxios = axios as any;
    mockAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: mockStudent,
      },
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("STU-2024-001")
      ).toBeInTheDocument();
    });
  });

  it("should display student name and email", async () => {
    const mockAxios = axios as any;
    mockAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: mockStudent,
      },
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("should display school name", async () => {
    const mockAxios = axios as any;
    mockAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: mockStudent,
      },
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test School")).toBeInTheDocument();
    });
  });

  it("should display enrolled courses", async () => {
    const mockAxios = axios as any;
    mockAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: mockStudent,
      },
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mathematics Basics")).toBeInTheDocument();
      expect(screen.getByText("English Literature")).toBeInTheDocument();
    });
  });

  it("should display enrollment count", async () => {
    const mockAxios = axios as any;
    mockAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: mockStudent,
      },
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/2 Enrolled Courses/i)).toBeInTheDocument();
    });
  });

  it("should handle errors gracefully", async () => {
    const mockAxios = axios as any;
    mockAxios.get = vi.fn().mockRejectedValue({
      response: {
        data: {
          message: "Failed to load profile",
        },
      },
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it("should have logout functionality", async () => {
    const mockAxios = axios as any;
    mockAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: mockStudent,
      },
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });
});
