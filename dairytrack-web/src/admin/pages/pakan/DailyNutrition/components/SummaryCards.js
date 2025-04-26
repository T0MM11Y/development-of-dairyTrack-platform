const SummaryCards = ({ chartData, filteredData, selectedCow, nutrientMeta }) => {
  return (
    <>
      {selectedCow && chartData.length > 0 && (
        <div className="row mb-4">
          {Object.keys(
            chartData.reduce((acc, item) => ({ ...acc, ...item.nutrients }), {})
          ).map((nutrient) => {
            const meta = nutrientMeta[nutrient] || {
              unit: "unit",
              multiplier: 1,
              icon: "📊",
              color: "info",
            };

            const total = chartData.reduce(
              (sum, item) => sum + (item.nutrients[nutrient] || 0),
              0
            );
            const average = (total / chartData.length) * meta.multiplier;
            const formattedAverage = Number.isInteger(average)
              ? average.toString()
              : average.toFixed(2).replace(/\.?0+$/, "");

            return (
              <div key={nutrient} className="col-xl-3 col-md-6 mb-4">
                <div className={`card border-left-${meta.color} shadow h-100 py-2`}>
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div
                          className={`text-xs font-weight-bold text-${meta.color} text-uppercase mb-1`}
                        >
                          Rata-rata {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {formattedAverage} {meta.unit}
                        </div>
                      </div>
                      <div className="col-auto">
                        <div
                          className={`avatar-sm rounded-circle bg-${meta.color} bg-soft p-4 ms-3`}
                        >
                          <span className="avatar-title rounded-circle h4 mb-0">
                            {meta.icon}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-info shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                      Total Pemberian Pakan
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {filteredData.length} kali
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="avatar-sm rounded-circle bg-info bg-soft p-4 ms-3">
                      <span className="avatar-title rounded-circle h4 mb-0">🐄</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryCards;
