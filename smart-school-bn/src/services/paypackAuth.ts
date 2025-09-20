import axios from "axios";

const baseURL = process.env.PAYPACK_BASE_URL!;

export interface PaypackToken {
    access: string;
    refresh: string;
    expires: string;
}

export const getAccessToken = async (): Promise<PaypackToken> => {
    const { data } = await axios.post<PaypackToken>(
        `${baseURL}/auth/agents/authorize`,
        {
            client_id: process.env.PAYPACK_CLIENT_ID,
            client_secret: process.env.PAYPACK_CLIENT_SECRET,
        },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
    );
    return data;
}
