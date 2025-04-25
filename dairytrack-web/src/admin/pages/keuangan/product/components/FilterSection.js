// components/FilterSection.jsx
import { useState } from "react";

const FilterSection = ({ onFilterChange, onExportPdf, onExportExcel, t }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [changeType, setChangeType] = useState("");

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newFilters = {
      start_date: startDate,
      end_date: endDate,
      change_type: changeType,
    };
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setChangeType("");
    onFilterChange({});
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title mb-4">Filter & Export</h4>
            <form onSubmit={handleFilterSubmit}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="form-group">
                    <label>{t("product.start_date")}</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="form-group">
                    <label>{t("product.end_date")}</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="form-group">
                    <label>{t("product.change_type")}</label>
                    <select
                      className="form-select"
                      value={changeType}
                      onChange={(e) => setChangeType(e.target.value)}
                    >
                      <option value="">{t("product.all")}</option>
                      <option value="sold">{t("product.sold")}</option>
                      <option value="expired">{t("product.expired")}</option>
                      <option value="contamination">
                        {t("product.contaminated")}
                      </option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3 mb-3 d-flex align-items-end">
                  <div className="form-group w-100">
                    <button type="submit" className="btn btn-primary me-2">
                      <i className="bx bx-filter-alt me-1"></i> Filter
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetFilters}
                    >
                      <i className="bx bx-reset me-1"></i> Reset
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="row mt-4">
              <div className="col-md-12 text-end">
                <button
                  className="btn btn-success me-2"
                  onClick={onExportExcel}
                >
                  <i className="bx bxs-file-export me-1"></i> Export Excel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={onExportPdf}
                >
                  <i className="bx bxs-file-pdf me-1"></i> Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;