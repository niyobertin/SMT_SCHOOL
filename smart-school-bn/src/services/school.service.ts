import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

export const schoolService = {
  async createSchool(data: {
    name: string;
    code: string;
    type?: "PUBLIC" | "SUBSCRIPTION";
    description?: string;
    logo?: string;
    contactEmail?: string;
    contactPhone?: string;
  }) {
    try {
      const school = await prisma.school.create({
        data: {
          id: uuidv4(),
          ...data,
        },
      });
      logger.info("School created", { schoolId: school.id, code: school.code });

      // Setup default data (Academic Year)
      await this.setupDefaultSchoolData(school.id);

      return school;
    } catch (error) {
      logger.error("Failed to create school", error);
      throw error;
    }
  },

  async setupDefaultSchoolData(schoolId: string) {
    try {
      const currentYear = new Date().getFullYear();
      const academicYear = await prisma.academicYear.create({
        data: {
          id: uuidv4(),
          schoolId,
          year: `${currentYear}-${currentYear + 1}`,
          isActive: true,
          startDate: new Date(currentYear, 8, 1), // September 1st
          endDate: new Date(currentYear + 1, 5, 30), // June 30th
        },
      });

      logger.info("Default school data setup complete", { schoolId });
      return { academicYear };
    } catch (error) {
      logger.error("Failed to setup default school data", error);
    }
  },

  async getSchoolByCode(code: string) {
    return prisma.school.findUnique({
      where: { code },
      include: {
        _count: {
          select: { students: true, courses: true, staff: true },
        },
      },
    });
  },

  async getSchoolById(id: string) {
    return prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true, courses: true, staff: true },
        },
      },
    });
  },

  async listSchools(page = 1, limit = 10, isActive?: boolean) {
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { students: true, courses: true, staff: true },
          },
        },
      }),
      prisma.school.count({ where }),
    ]);

    return {
      data: schools,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async activateSchool(id: string, isActive: boolean) {
    const school = await prisma.school.update({
      where: { id },
      data: { isActive },
    });
    logger.info("School activated/deactivated", {
      schoolId: id,
      isActive,
    });
    return school;
  },

  async assignStaffToSchool(data: {
    schoolId: string;
    userId: string;
    roleInSchool: "SCHOOL_ADMIN" | "TEACHER" | "GUARDIAN" | "SUPPORT_STAFF";
    assignedBy?: string;
  }) {
    try {
      const schoolStaff = await prisma.schoolStaff.create({
        data: {
          id: uuidv4(),
          ...data,
        },
        include: { user: true, school: true },
      });
      logger.info("Staff assigned to school", {
        schoolId: data.schoolId,
        userId: data.userId,
      });
      return schoolStaff;
    } catch (error) {
      logger.error("Failed to assign staff", error);
      throw error;
    }
  },

  async getSchoolStaff(schoolId: string) {
    return prisma.schoolStaff.findMany({
      where: { schoolId, isActive: true },
      include: { user: true },
      orderBy: { assignedAt: "desc" },
    });
  },
};
