import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";


const prisma = new PrismaClient();

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const categoryData = req.body;
        const existingCategory = await prisma.category.findUnique({
            where: { name: categoryData.name },
        });
        if (existingCategory) {
            res.status(409).json({
                status: "error",
                message: "Category already exists",
            });
            return;
        }
        const newCategory = await prisma.category.create({
            data: {
                id: uuidv4(),
                slug: categoryData.name.toLowerCase().replace(/\s/g, "-"),
                ...categoryData,
            },
        });

        res.status(201).json({
            status: "success",
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const query = req.query.q as string || "";
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: "desc" },
            include:{courses:true},
            take: limit,
            skip: startIndex,
            where: {
                name: {
                    contains: query,
                    mode: "insensitive",
                },
            },
        });
        const total = categories.length;
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            status: "success",
            message: "Categories retrieved successfully",
            data: {
                categories: categories,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id;
        const category = await prisma.category.findUnique({
            where: { id },
            include: { courses: true },
        });
        if (!category) {
            res.status(404).json({
                status: "error",
                message: "Category not found",
            });
            return;
        }
        res.status(200).json({
            status: "success",
            message: "Category retrieved successfully",
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id;
        const categoryData = req.body;
        const category = await prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            res.status(404).json({
                status: "error",
                message: "Category not found",
            });
            return;
        }
        const updatedCategory = await prisma.category.update({
            where: { id },
            data: categoryData,
        });
        res.status(200).json({
            status: "success",
            message: "Category updated successfully",
            data: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id;
        const category = await prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            res.status(404).json({
                status: "error",
                message: "Category not found",
            });
            return;
        }
        await prisma.category.delete({
            where: { id },
        });
        res.status(200).json({
            status: "success",
            message: "Category deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
