import React from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";


const RecentTransactions = ({ incomeData, expenseData, loading }) => {
  const formatCurrency = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;
  const { t } = useTranslation();

  const renderTransactionIcon = (transaction) => {
    const desc = transaction.description?.toLowerCase();
    if (desc?.includes("milk")) return "🥛";
    if (desc?.includes("cow")) return "🐄";
    if (desc?.includes("vet") || desc?.includes("doctor")) return "👨‍⚕️";
    if (desc?.includes("drug")) return "💊";
    return transaction.type === "income" ? "💰" : "💸";
  };

  const columns = [
    {
      name: "Description",
      selector: (row) => row.description,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <div className="avatar-sm me-3">
            <span
              className={`avatar-title rounded-circle ${
                row.type === "income"
                  ? "bg-success-subtle text-success"
                  : "bg-danger-subtle text-danger"
              } font-size-20`}
            >
              {renderTransactionIcon(row)}
            </span>
          </div>
          <div>
            <h6 className="mb-1">{row.description}</h6>
            <p className="mb-0 text-muted">
              {row.type === "income" ? "Income" : "Expense"}
            </p>
          </div>
        </div>
      ),
      grow: 2,
    },
    {
      name: "Method",
      selector: (row) =>
        row.payment_method || (row.type === "income" ? "Bank account" : "Credit card"),
    },
    {
      name: "Date",
      selector: (row) => new Date(row.transaction_date).toLocaleDateString("id-ID"),
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => row.formattedAmount,
      cell: (row) => (
        <div
          className={`text-end ${
            row.type === "income" ? "text-success" : "text-danger"
          }`}
        >
          {row.formattedAmount}
        </div>
      ),
      sortable: true,
    },
  ];

  const transactions = [
    ...incomeData.map((item) => ({
      ...item,
      type: "income",
      formattedAmount: `+${formatCurrency(item.amount)}`,
    })),
    ...expenseData.map((item) => ({
      ...item,
      type: "expense",
      formattedAmount: `-${formatCurrency(item.amount)}`,
    })),
  ]
    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
    .slice(0, 10);

  const customStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
        backgroundColor: "#f8f9fa",
      },
    },
    cells: {
      style: {
        padding: "12px",
      },
    },
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title">{t('finance.recent_transactions')}
              </h5>
              {/* <Link to="/finance/transactions" className="btn btn-sm btn-primary">
                View All
              </Link> */}
            </div>
            <DataTable
              columns={columns}
              data={transactions}
              pagination
              highlightOnHover
              striped
              responsive
              customStyles={customStyles}
              progressPending={loading}
              progressComponent={
                <div className="py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('finance.loading')}
                    ...</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;