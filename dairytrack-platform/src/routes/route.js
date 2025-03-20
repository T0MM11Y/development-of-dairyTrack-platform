import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "../frontend/userApp";
import AdminApp from "../backend/adminApp";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminApp />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
