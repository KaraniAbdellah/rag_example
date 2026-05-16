import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Sections from "./components/Sections";
import HowItWorks from "./components/HowItWorks";
import ChatWithLLM from "./components/ChatWithLLM";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Hero />
              <Sections />
              <HowItWorks />
              <Footer />
            </>
          }
        />

        <Route path="/notebook" element={<ChatWithLLM />} />
      </Routes>
    </div>
  );
}

export default App;
