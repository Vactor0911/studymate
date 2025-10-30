import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter basename="/studymate">
      <Routes>
        <Route path="/" element={<div>Hello World!</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
