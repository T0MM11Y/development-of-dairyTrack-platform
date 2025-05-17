// src/components/ExpenseTable.jsx
import React from 'react';

const ExpenseTable = ({ expenses, formatRupiah, loading }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-left text-sm font-nunito font-medium text-gray-600">
            <th className="py-3 px-4 w-12 text-center">#</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={expense.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4 text-center font-medium">{index + 1}</td>
              <td className="py-3 px-4 font-medium">{expense.description || 'N/A'}</td>
              <td className="py-3 px-4 font-medium">{expense.expense_type?.name || 'Unknown'}</td>
              <td className="py-3 px-4">
                <span className="inline-block px-2 py-1 rounded bg-red-500 text-white font-roboto text-xs">
                  -{formatRupiah(expense.amount)}
                </span>
              </td>
              <td className="py-3 px-4 font-medium">
                {new Date(expense.transaction_date).toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && expenses.length === 0 ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 font-nunito">No expenses found.</p>
        </div>
      ) : null}
    </div>
  );
};

export default ExpenseTable;