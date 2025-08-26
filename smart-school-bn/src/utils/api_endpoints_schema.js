
// ===============================================
// API ENDPOINTS SPECIFICATION
// ===============================================

/*
BASE URL: https://yourdomain.com/api/v1

Authentication: Bearer Token (JWT)
Content-Type: application/json

RESPONSE FORMAT:
{
  "success": boolean,
  "message": string,
  "data": object|array|null,
  "meta": {
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number
    }
  },
  "errors": array|null
}

HTTP STATUS CODES:
200 - OK
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
422 - Validation Error
500 - Internal Server Error

AUTHENTICATION ENDPOINTS
========================

POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email
POST   /auth/resend-verification

USER MANAGEMENT ENDPOINTS
=========================

GET    /users/profile
PUT    /users/profile
DELETE /users/profile
POST   /users/change-password
POST   /users/upload-avatar
GET    /users/dashboard-stats
GET    /users/learning-history
GET    /users/certificates

ADMIN USER MANAGEMENT
=====================

GET    /admin/users
GET    /admin/users/:id
PUT    /admin/users/:id
DELETE /admin/users/:id
PUT    /admin/users/:id/activate
PUT    /admin/users/:id/deactivate
GET    /admin/users/stats

CATEGORY MANAGEMENT
===================

GET    /categories
GET    /categories/:id
POST   /categories (Admin/Instructor)
PUT    /categories/:id (Admin/Instructor)
DELETE /categories/:id (Admin)
GET    /categories/:slug/courses

COURSE MANAGEMENT
=================

GET    /courses
GET    /courses/:id
GET    /courses/:slug
POST   /courses (Instructor/Admin)
PUT    /courses/:id (Instructor/Admin)
DELETE /courses/:id (Instructor/Admin)
PUT    /courses/:id/publish (Instructor/Admin)
PUT    /courses/:id/unpublish (Instructor/Admin)
POST   /courses/:id/enroll
GET    /courses/:id/lessons
GET    /courses/:id/students (Instructor/Admin)
GET    /courses/:id/analytics (Instructor/Admin)
GET    /courses/my-courses (Instructor)
GET    /courses/enrolled (Student)
GET    /courses/featured
GET    /courses/search

LESSON MANAGEMENT
=================

GET    /lessons/:id
POST   /courses/:courseId/lessons (Instructor/Admin)
PUT    /lessons/:id (Instructor/Admin)
DELETE /lessons/:id (Instructor/Admin)
PUT   /lessons/:id/reorder (Instructor/Admin)
GET    /lessons/:id/content
POST   /lessons/:id/content (Instructor/Admin)
PUT    /lessons/:id/content/:contentId (Instructor/Admin)
DELETE /lessons/:id/content/:contentId (Instructor/Admin)

CONTENT/FILE MANAGEMENT
=======================

POST   /upload/course-thumbnail
POST   /upload/lesson-video
POST   /upload/lesson-audio
POST   /upload/lesson-pdf
POST   /upload/lesson-document
GET    /files/:id/download (Authenticated)
GET    /files/:id/stream (Authenticated)
DELETE /files/:id (Instructor/Admin)

ENROLLMENT MANAGEMENT
=====================

POST   /enrollments (Student)
GET    /enrollments/my-enrollments (Student)
GET    /enrollments/:id
DELETE /enrollments/:id (Admin/Student)
PUT    /enrollments/:id/complete
GET    /courses/:courseId/enrollments (Instructor/Admin)

PAYMENT ENDPOINTS
=================

POST   /payments/create-intent
POST   /payments/confirm
GET    /payments/history
GET    /payments/:id
POST   /payments/refund/:id (Admin)
POST   /payments/webhook/stripe
POST   /payments/webhook/paypal

TEST MANAGEMENT
===============

GET    /tests
GET    /tests/:id
POST   /courses/:courseId/tests (Instructor/Admin)
PUT    /tests/:id (Instructor/Admin)
DELETE /tests/:id (Instructor/Admin)
GET    /tests/:id/questions
POST   /tests/:id/questions (Instructor/Admin)
PUT    /questions/:id (Instructor/Admin)
DELETE /questions/:id (Instructor/Admin)
PUT    /questions/:id/reorder (Instructor/Admin)

TEST TAKING
===========

POST   /tests/:id/start
GET    /test-attempts/:attemptId
PUT    /test-attempts/:attemptId/answer
POST   /test-attempts/:attemptId/submit
GET    /test-attempts/:attemptId/results
GET    /tests/:testId/my-attempts
GET    /tests/:testId/leaderboard

PROGRESS TRACKING
=================

GET    /progress/courses/:courseId
GET    /progress/lessons/:lessonId
POST   /progress/lessons/:lessonId/complete
PUT    /progress/lessons/:lessonId/bookmark
GET    /progress/dashboard
GET    /progress/certificates

REVIEW SYSTEM
=============

GET    /courses/:courseId/reviews
POST   /courses/:courseId/reviews (Student)
PUT    /reviews/:id (Student)
DELETE /reviews/:id (Student/Admin)
GET    /reviews/my-reviews (Student)

ANALYTICS & REPORTING
=====================

GET    /analytics/dashboard (Admin/Instructor)
GET    /analytics/courses/:courseId (Instructor/Admin)
GET    /analytics/students/:userId (Admin)
GET    /analytics/revenue (Admin/Instructor)
GET    /analytics/popular-courses
GET    /analytics/user-engagement
GET    /reports/course-completion (Admin/Instructor)
GET    /reports/revenue (Admin)
GET    /reports/user-activity (Admin)

CERTIFICATE MANAGEMENT
======================

GET    /certificates
GET    /certificates/:id
POST   /certificates/generate/:courseId
GET    /certificates/:id/download
GET    /certificates/:id/verify
GET    /certificates/validate/:certificateNumber

SYSTEM ADMINISTRATION
=====================

GET    /admin/settings
PUT    /admin/settings
GET    /admin/system-health
GET    /admin/logs
POST   /admin/backup
GET    /admin/stats
PUT    /admin/maintenance-mode

NOTIFICATION SYSTEM
===================

GET    /notifications
PUT    /notifications/:id/read
PUT    /notifications/mark-all-read
POST   /notifications/preferences

SEARCH & FILTERING
==================

GET    /search/courses?q=query&category=&level=&price=
GET    /search/instructors?q=query
GET    /search/global?q=query

Example Endpoint Details:
=========================

POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}

GET /courses?page=1&limit=10&category=programming&level=beginner
Response: {
  "success": true,
  "data": [...courses],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}

POST /courses/:id/enroll
Body: {
  "paymentIntentId": "pi_1234567890"
}
Response: {
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "enrollment": { ... }
  }
}
*/