import { FaWhatsapp } from "react-icons/fa";


export const WhatsAppButton = () => {
    return (
        <a
            href="https://wa.me/250781212252"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        >
            <FaWhatsapp className="h-6 w-6" />
        </a>
    );
}
