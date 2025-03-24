import React from "react";

const MonthlySummary = () => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Monthly Summary</h4>
        <div className="row">
          <div className="col-4 text-center">
            <h5>34,750 L</h5>
            <p className="mb-2 text-truncate">Milk Produced</p>
          </div>
          <div className="col-4 text-center">
            <h5>$20,158</h5>
            <p className="mb-2 text-truncate">Revenue</p>
          </div>
          <div className="col-4 text-center">
            <h5>26,200 kg</h5>
            <p className="mb-2 text-truncate">Feed Used</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;