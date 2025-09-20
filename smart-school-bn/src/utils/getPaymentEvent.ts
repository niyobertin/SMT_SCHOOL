import axios from "axios";
import { getAccessToken } from "../services/paypackAuth";

export const getTransactionEvents = async (ref: string) => {
    const { access } = await getAccessToken();

    const { data } = await axios.get(
        `${process.env.PAYPACK_BASE_URL}/events/transactions?ref=${ref}`,
        {
            headers: {
                Authorization: `Bearer ${access}`,
                Accept: "application/json",
            },
        }
    );
    return data;
};
