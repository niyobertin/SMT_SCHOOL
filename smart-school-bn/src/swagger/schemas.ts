/**
 * @swagger
 * tags:
 *   - name: Schools
 *     description: School management endpoints (admin only)
 *   - name: Students
 *     description: Student CRUD and enrollment endpoints
 *   - name: Student Auth
 *     description: Student authentication and profile endpoints
 */

/**
 * @swagger
 * /schools:
 *   post:
 *     summary: Create a new school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - email
 *               - phone
 *               - address
 *               - schoolType
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Primary School District"
 *               code:
 *                 type: string
 *                 example: "PS-2024"
 *               email:
 *                 type: string
 *                 example: "admin@primaryschool.edu"
 *               phone:
 *                 type: string
 *                 example: "+1-555-0101"
 *               address:
 *                 type: string
 *                 example: "123 Education Street"
 *               city:
 *                 type: string
 *                 example: "Springfield"
 *               state:
 *                 type: string
 *                 example: "IL"
 *               zipCode:
 *                 type: string
 *                 example: "62701"
 *               schoolType:
 *                 type: string
 *                 enum: ["PRIMARY", "SECONDARY", "TERTIARY", "VOCATIONAL"]
 *               principalName:
 *                 type: string
 *                 example: "Dr. Margaret Johnson"
 *     responses:
 *       201:
 *         description: School created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Duplicate school code
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *
 *   get:
 *     summary: List all schools (paginated)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of schools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       totalStudents:
 *                         type: integer
 *                       totalCourses:
 *                         type: integer
 *                       totalStaff:
 *                         type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     skip:
 *                       type: integer
 *                     take:
 *                       type: integer
 *
 * /schools/{schoolId}:
 *   get:
 *     summary: Get school details
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School details
 *       404:
 *         description: School not found
 *
 *   patch:
 *     summary: Activate/deactivate school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: School updated
 *       404:
 *         description: School not found
 *
 * /schools/{schoolId}/staff:
 *   post:
 *     summary: Assign staff to school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleInSchool
 *             properties:
 *               userId:
 *                 type: string
 *               roleInSchool:
 *                 type: string
 *                 enum: ["SCHOOL_ADMIN", "TEACHER", "GUARDIAN", "SUPPORT_STAFF"]
 *     responses:
 *       201:
 *         description: Staff assigned successfully
 *       404:
 *         description: School or user not found
 *
 *   get:
 *     summary: List school staff
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of school staff
 *
 * /schools/{schoolId}/students:
 *   post:
 *     summary: Create student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - firstName
 *               - lastName
 *               - email
 *               - credentialHash
 *             properties:
 *               studentId:
 *                 type: string
 *                 example: "STU-2024-001"
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               credentialHash:
 *                 type: string
 *                 description: "Should be pre-hashed with bcrypt"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: ["M", "F", "OTHER"]
 *               schoolClassId:
 *                 type: string
 *               academicYearId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created
 *       400:
 *         description: Duplicate student ID in school
 *
 *   get:
 *     summary: List students in school
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["ACTIVE", "INACTIVE", "TRANSFERRED", "GRADUATED"]
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of students
 *
 * /schools/{schoolId}/students/{studentId}:
 *   get:
 *     summary: Get student details
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student details
 *       404:
 *         description: Student not found
 *
 * /schools/students/{studentId}/enroll:
 *   post:
 *     summary: Enroll student in course
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student enrolled in course
 *       400:
 *         description: Already enrolled
 *
 * /schools/students/{studentId}/enrollments:
 *   get:
 *     summary: Get student enrollments
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of student enrollments
 *
 * /student-auth/login:
 *   post:
 *     summary: Student login
 *     tags: [Student Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolCode
 *               - studentId
 *               - password
 *             properties:
 *               schoolCode:
 *                 type: string
 *                 example: "PS-2024"
 *               studentId:
 *                 type: string
 *                 example: "STU-2024-001"
 *               password:
 *                 type: string
 *                 example: "1234"
 *                 description: "Student PIN or password"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: "JWT token"
 *                     student:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         studentId:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         schoolId:
 *                           type: string
 *                         schoolName:
 *                           type: string
 *                     expiresIn:
 *                       type: string
 *                       example: "24h"
 *       401:
 *         description: Invalid credentials
 *
 * /student-auth/me:
 *   get:
 *     summary: Get current student profile
 *     tags: [Student Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     studentId:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     schoolId:
 *                       type: string
 *                     enrollments:
 *                       type: array
 *                       items:
 *                         type: object
 *                     progressCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *
 * /student-auth/refresh:
 *   post:
 *     summary: Refresh student token
 *     tags: [Student Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Unauthorized or token expired
 */

// Security scheme definition
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for student or user authentication
 */
