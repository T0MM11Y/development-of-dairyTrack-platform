import React from "react";
import { useTranslation } from "react-i18next";


const FinanceSummaryCards = ({ currentBalance, totalIncome, totalExpense, loading }) => {
  const formatCurrency = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;
  const { t } = useTranslation();

  const Card = ({ title, value, percentage, icon, bgColor }) => (
    <div className="col-xl-4 col-md-6 mb-4">
      <div className="card h-100 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
          <div
            className={`rounded-circle ${bgColor} d-flex justify-content-center align-items-center mb-3`}
            style={{ width: "48px", height: "48px" }}
          >
            <span className="h3 mb-0">{icon}</span>
          </div>
          <p className="text-muted fw-medium mb-1" style={{ fontSize: "0.9rem" }}>
            {title}
          </p>
          <h4
            className={`mb-2 ${loading ? "text-muted" : ""}`}
            style={{ fontSize: "1.5rem", fontWeight: "600" }}
          >
            {loading ? "Loading..." : value}
          </h4>
          <div>
            <span
              className={`badge ${
                percentage >= 0 ? "bg-success" : "bg-danger"
              } fw-bold font-size-12 me-2`}
            >
              <i
                className={`bx ${
                  percentage >= 0 ? "bx-up-arrow-alt" : "bx-down-arrow-alt"
                } me-1 align-middle`}
              ></i>
              {Math.abs(percentage)}%
            </span>
            <span className="text-muted font-size-12">{t('finance.from_previous_period')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="row mb-4">
      <Card
        title="Available Balance"
        value={formatCurrency(currentBalance)}
        percentage={20}
        icon="💰"
        bgColor="bg-primary bg-soft"
      />
      <Card
        title="Total Income"
        value={formatCurrency(totalIncome)}
        percentage={20}
        icon="📈"
        bgColor="bg-success bg-soft"
      />
      <Card
        title="Total Expense"
        value={formatCurrency(totalExpense)}
        percentage={5}
        icon="📉"
        bgColor="bg-danger bg-soft"
      />
    </div>
  );
};

export default FinanceSummaryCards;