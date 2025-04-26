const FilterSection = ({
  uniqueCows,
  cowNames,
  selectedCow,
  setSelectedCow,
  dateRange,
  setDateRange,
  loading,
  handleApplyFilters,
}) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">
              Pilih Sapi <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={selectedCow}
              onChange={(e) => setSelectedCow(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Pilih Sapi --</option>
              {uniqueCows.map((cowId) => (
                <option key={cowId} value={cowId}>
                  {cowNames[cowId] || `Sapi #${cowId}`}
                </option>
              ))}
            </select>
            {!selectedCow && (
              <small className="text-muted">
                Sapi harus dipilih untuk melihat grafik
              </small>
            )}
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Tanggal Mulai</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Tanggal Akhir</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="col-md-2 mb-3 d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              <i className="ri-filter-3-line me-1"></i> Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
