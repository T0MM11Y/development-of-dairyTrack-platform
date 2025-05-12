import React from "react";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <div className="container text-center py-3">
        <span>&copy; {currentYear} Your Company. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default AdminFooter;
