import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "../frontend/userApp";
import Login from "../auth/login";

import AdminApp from "../backend/adminApp";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
