import {
    LayoutDashboard,
    Users,
    Building2,
    GraduationCap,
    BookOpen,
    UserPlus,
    FileText,
    PenTool,
    ClipboardList,
    Home,
    CreditCard,
    FileQuestion,
    Briefcase
} from 'lucide-react';
import type { NavItem } from '../../components/common/BaseSidebarLayout';

export const allNavItems: NavItem[] = [
    {
        path: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER']
    },
    // Organizations & Academic (Admin/SuperAdmin)
    {
        path: '/dashboard/organizations',
        icon: Building2,
        label: 'Organizations/Schools',
        roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
        path: '/dashboard/academic',
        icon: GraduationCap,
        label: 'Academic Management',
        roles: ['SUPER_ADMIN', 'ADMIN']
    },

    // User & Enrollment Management
    {
        path: '/dashboard/users',
        icon: Users,
        label: 'User Management',
        roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
        path: '/dashboard/assignments',
        icon: UserPlus,
        label: 'Teacher Assignments',
        roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR']
    },

    // LMS Modules
    {
        path: '/dashboard/courses',
        icon: BookOpen,
        label: 'Course Management',
        roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR']
    },
    {
        path: '/dashboard/tests',
        icon: FileQuestion,
        label: 'LMS Tests',
        roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR']
    },
    {
        path: '/dashboard/subscriptions',
        icon: CreditCard,
        label: 'Subscriptions',
        roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
        path: '/dashboard/content',
        icon: Briefcase,
        label: 'Job Postings',
        roles: ['SUPER_ADMIN', 'ADMIN']
    },

    // Exam System
    {
        path: '/dashboard/exams',
        icon: FileText,
        label: 'Exams',
        roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER']
    },
    {
        path: '/dashboard/candidates',
        icon: Users,
        label: 'Candidates',
        roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER']
    },
    {
        path: '/dashboard/marking',
        icon: PenTool,
        label: 'Marking',
        roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER']
    },
    {
        path: '/dashboard/results',
        icon: ClipboardList,
        label: 'Exam Results',
        roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'EXAMINER']
    },

    // Global
    {
        path: '/',
        icon: Home,
        label: 'Public Site'
    },
];
