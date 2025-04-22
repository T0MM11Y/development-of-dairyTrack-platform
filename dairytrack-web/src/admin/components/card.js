import React from "react";

const Card = ({ title, value, percentage, icon }) => {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="card">
        <div className="card-body">
          <div className="d-flex">
            <div className="flex-grow-1">
              <p className="text-truncate font-size-14 mb-2">{title}</p>
              <h4 className="mb-2">{value}</h4>
              <p className="text-muted mb-0">
                <span
                  className={`text-${
                    percentage >= 0 ? "success" : "danger"
                  } fw-bold font-size-12 me-2`}
                >
                  <i
                    className={`ri-arrow-right-${
                      percentage >= 0 ? "up" : "down"
                    }-line me-1 align-middle`}
                  ></i>
                  {Math.abs(percentage)}%
                </span>
                from previous period
              </p>
            </div>
            <div className="avatar-sm">
              <span className="avatar-title bg-light text-primary rounded-3">
                <i className={`${icon} font-size-24`}></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;