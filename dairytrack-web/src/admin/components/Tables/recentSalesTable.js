import React from "react";

const RecentSalesTable = () => {
  return (
    <div className="table-responsive">
      <table className="table table-centered mb-0 align-middle table-hover table-nowrap">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Quantity (L)</th>
            <th>Quality</th>
            <th>Price/L</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["2023-05-07", 1200, "A", 0.58, "Completed"],
            ["2023-05-06", 980, "B", 0.52, "Completed"],
            ["2023-05-05", 1150, "A", 0.58, "Completed"],
            ["2023-05-04", 1050, "A", 0.58, "Completed"],
            ["2023-05-03", 1100, "B", 0.52, "Completed"],
          ].map((sale, index) => (
            <tr key={index}>
              <td>{sale[0]}</td>
              <td>{sale[1]}</td>
              <td>{sale[2]}</td>
              <td>${sale[3].toFixed(2)}</td>
              <td>${(sale[1] * sale[3]).toFixed(2)}</td>
              <td>
                <div className="font-size-13">
                  <i className="ri-checkbox-blank-circle-fill font-size-10 text-success align-middle me-2"></i>
                  {sale[4]}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentSalesTable;