// components/ChangeTypeCard.jsx
const ChangeTypeCard = ({ title, value, icon, type }) => {
    // Define colors for different change types
    const getTypeColor = (type) => {
      const colors = {
        sold: "bg-success",
        expired: "bg-danger",
        contamination: "bg-warning"
      };
      return colors[type] || "bg-info";
    };
    
    const bgColor = getTypeColor(type);
    
    return (
      <div className="card" style={{ height: "200px" }}>
        <div className="card-body d-flex flex-column justify-content-center">
          <h5 className="card-title mb-4 text-center">{title}</h5>
          <div className="text-center flex-grow-1 d-flex flex-column justify-content-center">
            <h2 className="mb-3">{value}</h2>
            <div
              className={`avatar-md rounded-circle ${bgColor} p-3 mx-auto mb-3`}
            >
              <span className="avatar-title rounded-circle h3 mb-0 text-white">
                {icon}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ChangeTypeCard;