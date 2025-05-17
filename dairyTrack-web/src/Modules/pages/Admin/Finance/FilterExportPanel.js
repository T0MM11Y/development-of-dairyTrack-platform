// src/components/FilterExportPanel.jsx
import React from 'react';

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
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h5 className="text-lg font-nunito font-semibold mb-4">Filter & Export</h5>
      <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-nunito font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-nunito font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-nunito font-medium mb-1">Finance Type</label>
          <select
            value={financeType}
            onChange={(e) => setFinanceType(e.target.value)}
            disabled={loading}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="flex items-end space-x-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            <i className="bx bx-filter-alt mr-1"></i> Filter
          </button>
          <button
            type="button"
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={resetFilters}
            disabled={loading}
          >
            <i className="bx bx-reset mr-1"></i> Reset
          </button>
        </div>
      </form>
      <div className="flex justify-end mt-4 space-x-2">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleExportExcel}
          disabled={loading}
        >
          <i className="bx bxs-file-excel mr-1"></i> Export Excel
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleExportPdf}
          disabled={loading}
        >
          <i className="bx bxs-file-pdf mr-1"></i> Export PDF
        </button>
      </div>
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default FilterExportPanel;