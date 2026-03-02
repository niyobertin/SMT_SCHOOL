import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface StudentProfile {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  school: {
    id: string;
    name: string;
    code: string;
  };
  enrollments: Array<{
    id: string;
    courseId: string;
    course: {
      id: string;
      title: string;
      thumbnail?: string;
      progress?: number;
    };
    enrollmentDate: string;
    isCompleted: boolean;
  }>;
  progressCount: number;
  createdAt: string;
}

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken_student");
      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/student-auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load profile"
      );
      localStorage.removeItem("accessToken_student");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Profile not found"}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {profile.firstName}!
          </h2>
          <p className="text-gray-500 text-sm">
            Here's what's happening with your studies today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#1a7ea5] bg-[#1a7ea5]/5 px-4 py-2 rounded-full border border-[#1a7ea5]/10">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {profile.school.name}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Student ID</p>
          <p className="text-2xl font-bold text-blue-600">
            {profile.studentId}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Full Name</p>
          <p className="text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Enrolled Courses</p>
          <p className="text-2xl font-bold text-green-600">
            {profile.enrollments.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Progress Lessons</p>
          <p className="text-2xl font-bold text-purple-600">
            {profile.progressCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Courses</h2>
        {profile.enrollments.length === 0 ? (
          <p className="text-gray-600">No courses enrolled yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() =>
                  navigate(`/student/courses/${enrollment.courseId}`)
                }
              >
                {enrollment.course.thumbnail && (
                  <img
                    src={enrollment.course.thumbnail}
                    alt={enrollment.course.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold line-clamp-2">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {enrollment.isCompleted ? (
                      <span className="text-green-600">✓ Completed</span>
                    ) : (
                      <span className="text-blue-600">In Progress</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium">
              {profile.email || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">School</p>
            <p className="text-lg font-medium">{profile.school.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="text-lg font-medium">
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
