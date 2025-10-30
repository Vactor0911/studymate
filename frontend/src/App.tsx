import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Curriculum, Login, Main, Signup } from "./pages";
import Header from "./components/Header";
import { useEffect } from "react";
import { bootstrapAuth } from "./services/auth";
import Result from "./pages/Result";

const App = () => {
  // Refresh Token이 있다면 자동 세션 복구
  useEffect(() => {
    bootstrapAuth();
  }, []);

  return (
    <BrowserRouter basename="/studymate">
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/curriculum/:uuid" element={<Curriculum />} />
        <Route path="/result/:uuid" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
