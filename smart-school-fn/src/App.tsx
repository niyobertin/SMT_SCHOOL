import { BrowserRouter, useRoutes } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from "./components/common/ScrollToTop";
import { routesConfig } from "./routes/routesConfig";

const AppRoutes = () => {
  const element = useRoutes(routesConfig);
  return element;
};

function App() {
  return (
    <TranslationProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={5000} />
        <AppRoutes />
      </BrowserRouter>
    </TranslationProvider>
  );
}

export default App;

