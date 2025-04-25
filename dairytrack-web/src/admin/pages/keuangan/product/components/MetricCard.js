// components/MetricCard.jsx
const MetricCard = ({ title, value, percentage, icon, bgColor }) => {
    return (
      <div className="card" style={{ height: "200px" }}>
        <div className="card-body d-flex flex-column justify-content-center">
          <h5 className="card-title mb-4 text-center">{title}</h5>
          <div className="text-center flex-grow-1 d-flex flex-column justify-content-center">
            <h2 className="mb-3">{value}</h2>
            <div
              className={`avatar-md rounded-circle ${bgColor} p-3 mx-auto mb-3`}
            >
              <span className="avatar-title rounded-circle h3 mb-0">
                {icon}
              </span>
            </div>
            <div className="mt-2">
              <span
                className={`badge ${
                  percentage >= 0 ? "bg-success" : "bg-danger"
                } fw-bold font-size-12 me-2`}
              >
                <i
                  className={`bx ${
                    percentage >= 0 ? "bx-up-arrow-alt" : "bx-down-arrow-alt"
                  } me-1 align-middle`}
                ></i>
                {Math.abs(percentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default MetricCard;