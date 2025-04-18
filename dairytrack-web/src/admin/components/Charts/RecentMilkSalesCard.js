import React from "react";

const RecentMilkSalesCard = () => {
  const salesData = [
    ["2023-05-01", 500, "A", 2.5, "Completed"],
    ["2023-05-02", 450, "B", 2.3, "Pending"],
    ["2023-05-03", 600, "A", 2.6, "Completed"],
    ["2023-05-04", 400, "C", 2.1, "Cancelled"],
  ];

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Recent Milk Sales</h4>
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
              {salesData.map((sale, index) => (
                <tr key={index}>
                  <td>{sale[0]}</td>
                  <td>{sale[1]}</td>
                  <td>{sale[2]}</td>
                  <td>${sale[3].toFixed(2)}</td>
                  <td>${(sale[1] * sale[3]).toFixed(2)}</td>
                  <td>
                    <div className="font-size-13">
                      <i
                        className={`ri-checkbox-blank-circle-fill font-size-10 text-${
                          sale[4] === "Completed" ? "success" : sale[4] === "Pending" ? "warning" : "danger"
                        } align-middle me-2`}
                      ></i>
                      {sale[4]}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentMilkSalesCard;