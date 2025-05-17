// src/components/FinanceSummaryCards.jsx
import React from 'react';

const FinanceSummaryCards = ({ currentBalance, totalIncome, totalExpense, loading, formatRupiah }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md opacity-90">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="text-sm font-nunito font-medium">Available Balance</h6>
            <h2 className="text-2xl font-nunito font-semibold mt-2">
              {loading ? 'Loading...' : formatRupiah(currentBalance)}
            </h2>
          </div>
          <i className="fas fa-wallet text-4xl opacity-50"></i>
        </div>
      </div>
      <div className="bg-green-500 text-white p-4 rounded-lg shadow-md opacity-90">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="text-sm font-nunito font-medium">Total Income</h6>
            <h2 className="text-2xl font-nunito font-semibold mt-2">
              {loading ? 'Loading...' : formatRupiah(totalIncome)}
            </h2>
          </div>
          <i className="fas fa-arrow-up text-4xl opacity-50"></i>
        </div>
      </div>
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-md opacity-90">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="text-sm font-nunito font-medium">Total Expense</h6>
            <h2 className="text-2xl font-nunito font-semibold mt-2">
              {loading ? 'Loading...' : formatRupiah(totalExpense)}
            </h2>
          </div>
          <i className="fas fa-arrow-down text-4xl opacity-50"></i>
        </div>
      </div>
    </div>
  );
};

export default FinanceSummaryCards;