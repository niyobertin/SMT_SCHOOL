import * as yup from "yup";

export const courseSchema = yup.object().shape({
    title: yup.string().required(),
    description: yup.string().required(),
    shortDescription: yup.string().required().max(200),
    thumbnail: yup.string().nullable(),
    language: yup.string().required(),
    level: yup.string().oneOf(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).required(),
    status: yup.string().oneOf(['DRAFT', 'PUBLISHED', 'ARCHIVED']).required(),
    isPublished: yup.boolean(),
    isFeatured: yup.boolean(),
    categoryId: yup.string().required('Please select a category or add a new one'),
  });