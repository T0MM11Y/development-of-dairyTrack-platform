import React from "react";
import { useTranslation } from "react-i18next";


const FilterExportPanel = ({
  startDate,
  endDate,
  financeType,
  setStartDate,
  setEndDate,
  setFinanceType,
  handleFilterSubmit,
  resetFilters,
  handleExportExcel,
  handleExportPdf,
  error,
  loading,
}) => {
  const { t } = useTranslation();
  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title mb-4">{t('finance.filter_export')}
            </h4>
            <form onSubmit={handleFilterSubmit}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="form-group">
                    <label>{t('finance.start_date')}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="form-group">
                    <label>{t('finance.end_date')}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="form-group">
                    <label>{t('finance.finance_type')}
                    </label>
                    <select
                      className="form-select"
                      value={financeType}
                      onChange={(e) => setFinanceType(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">{t('finance.all')}
                      </option>
                      <option value="income">{t('finance.income')}
                      </option>
                      <option value="expense">{t('finance.expense')}
                      </option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3 mb-3 d-flex align-items-end">
                  <div className="form-group w-100">
                    <button
                      type="submit"
                      className="btn btn-primary me-2"
                      disabled={loading}
                    >
                      <i className="bx bx-filter-alt me-1"></i> {t('finance.filter')}

                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetFilters}
                      disabled={loading}
                    >
                      <i className="bx bx-reset me-1"></i> {t('finance.reset')}

                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="row mt-4">
              <div className="col-md-12 text-end">
                <button
                  className="btn btn-success me-2"
                  onClick={handleExportExcel}
                  disabled={loading}
                >
                  <i className="bx bxs-file-export me-1"></i> {t('finance.export_excel')}

                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleExportPdf}
                  disabled={loading}
                >
                  <i className="bx bxs-file-pdf me-1"></i> {t('finance.export_pdf')}

                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterExportPanel;
