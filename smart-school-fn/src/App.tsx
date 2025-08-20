import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layouts/Main";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { TranslationProvider } from "./contexts/TranslationContext";

function App() {
  return (
    <TranslationProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TranslationProvider>
  );
}

export default App;
