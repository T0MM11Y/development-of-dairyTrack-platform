import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./Auth/login";
import UserApp from "./user/UserApp";
import AdminApp from "./admin/adminApp";

function App() {
  return (
    <div>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<UserApp />} />
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/logout" element={<UserApp />} />
      </Routes>
    </div>
  );
}

export default App;
