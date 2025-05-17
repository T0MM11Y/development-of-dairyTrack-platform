// src/components/RecentTransactions.jsx
import React, { useMemo } from 'react';

const RecentTransactions = ({
  incomeData,
  expenseData,
  currentPage,
  setCurrentPage,
  transactionsPerPage,
  formatRupiah,
  loading,
}) => {
  const paginatedTransactions = useMemo(() => {
    const transactions = [
      ...incomeData.map((item) => ({
        ...item,
        type: 'income',
        formattedAmount: `+${formatRupiah(item.amount)}`,
      })),
      ...expenseData.map((item) => ({
        ...item,
        type: 'expense',
        formattedAmount: `-${formatRupiah(item.amount)}`,
      })),
    ].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

    const totalItems = transactions.length;
    const totalPages = Math.ceil(totalItems / transactionsPerPage);
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const paginatedItems = transactions.slice(startIndex, startIndex + transactionsPerPage);

    return { transactions: paginatedItems, totalItems, totalPages };
  }, [incomeData, expenseData, currentPage, transactionsPerPage, formatRupiah]);

  const renderTransactionIcon = (transaction) => {
    const desc = transaction.description?.toLowerCase();
    if (desc?.includes('milk')) return '🥛';
    if (desc?.includes('cow')) return '🐄';
    if (desc?.includes('vet') || desc?.includes('doctor')) return '👨‍⚕️';
    if (desc?.includes('drug')) return '💊';
    return transaction.type === 'income' ? '💰' : '💸';
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h5 className="text-lg font-nunito font-semibold mb-4">Recent Transactions</h5>
      {loading && paginatedTransactions.transactions.length === 0 ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr className="text-left text-sm font-nunito font-medium text-gray-600">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id || `${transaction.type}-${index}`}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-center font-medium">
                      {(currentPage - 1) * transactionsPerPage + index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span
                          className={`mr-3 rounded-full w-8 h-8 flex items-center justify-center ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {renderTransactionIcon(transaction)}
                        </span>
                        <span className="font-medium">{transaction.description || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {transaction.type === 'income'
                        ? transaction.income_type?.name || 'Unknown'
                        : transaction.expense_type?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-white font-roboto text-xs ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      >
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-white font-roboto text-xs ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      >
                        {transaction.formattedAmount}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {new Date(transaction.transaction_date).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginatedTransactions.totalItems === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 font-nunito">No transactions found.</p>
            </div>
          )}
          {paginatedTransactions.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-gray-600">
                Showing {(currentPage - 1) * transactionsPerPage + 1} to{' '}
                {Math.min(currentPage * transactionsPerPage, paginatedTransactions.totalItems)} of{' '}
                {paginatedTransactions.totalItems} entries
              </div>
              <nav className="flex space-x-1">
                <button
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
                <button
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                {[...Array(paginatedTransactions.totalPages).keys()].map((page) => {
                  const pageNumber = page + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === paginatedTransactions.totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return (
                      <span key={pageNumber} className="px-3 py-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  className={`px-3 py-1 rounded ${
                    currentPage === paginatedTransactions.totalPages ? 'bg-gray-200' : 'bg-blue-500 text-white'
                  }`}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === paginatedTransactions.totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    currentPage === paginatedTransactions.totalPages ? 'bg-gray-200' : 'bg-blue-500 text-white'
                  }`}
                  onClick={() => setCurrentPage(paginatedTransactions.totalPages)}
                  disabled={currentPage === paginatedTransactions.totalPages}
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecentTransactions;