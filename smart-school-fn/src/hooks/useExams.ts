import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../redux/api/api';

export interface ExamFilters {
    organizationId?: string;
    status?: string;
    search?: string;
    date?: string;
    archived?: boolean;
}

export const useExams = (filters: ExamFilters) => {
    return useQuery(
        ['exams', filters],
        async () => {
            const { data } = await api.get('/exams/all', { params: filters });
            return data;
        },
        {
            keepPreviousData: true,
            staleTime: 30000,
        }
    );
};

export const useOrganizations = () => {
    return useQuery('organizations', async () => {
        const { data } = await api.get('/exams/organizations');
        return data;
    });
};

export const useExamDetails = (examId: string) => {
    return useQuery(
        ['exam', examId],
        async () => {
            const { data } = await api.get(`/exams/${examId}`);
            return data;
        },
        { enabled: !!examId }
    );
};

export const useCreateExam = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ orgId, data }: { orgId: string; data: any }) => {
            const response = await api.post(`/exams/organizations/${orgId}/exams`, data);
            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('exams');
            },
        }
    );
};

export const useUpdateExam = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ examId, data }: { examId: string; data: any }) => {
            const response = await api.patch(`/exams/${examId}`, data);
            return response.data;
        },
        {
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries('exams');
                queryClient.invalidateQueries(['exam', variables.examId]);
            },
        }
    );
};

export const useDeleteExam = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async (examId: string) => {
            await api.delete(`/exams/${examId}`);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('exams');
            },
        }
    );
};

export const useQuestions = (examId: string) => {
    return useQuery(
        ['questions', examId],
        async () => {
            const { data } = await api.get(`/exams/${examId}/questions`);
            return data;
        },
        { enabled: !!examId }
    );
};

export const useCandidates = (params: any) => {
    return useQuery(
        ['candidates', params],
        async () => {
            const { data } = await api.get('/exams/candidates/all', { params });
            return data;
        },
        { keepPreviousData: true }
    );
};

export const useAssignCandidates = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ examId, candidateIds }: { examId: string; candidateIds: string[] }) => {
            const response = await api.post(`/exams/${examId}/assign-bulk`, { candidateIds });
            return response.data;
        },
        {
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries(['exam', variables.examId]);
            },
        }
    );
};

