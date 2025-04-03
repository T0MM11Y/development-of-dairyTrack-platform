import React from "react";
import Card from "../components/card";
import AreaChart from "../components/Charts/areaChart";
import ColumnChart from "../components/Charts/columnChart";
import RecentSalesTable from "../components/Tables/recentSalesTable";
import MonthlySummary from "../components/Summary/montlySummary";

const Content = () => {
  return (
    <div className="page-content w-100 px-3">
      <div className="container-fluid">
        <div className="row">
          <Card
            title="Total Milk Production"
            value="14,520 L"
            percentage={9.23}
            icon="ri-drop-line"
          />
          <Card
            title="Healthy Cows"
            value="238"
            percentage={2.4}
            icon="ri-heart-pulse-line"
          />
          <Card
            title="Feed Stock"
            value="8,246 kg"
            percentage={-3.2}
            icon="ri-leaf-line"
          />
          <Card
            title="Monthly Revenue"
            value="$29,670"
            percentage={11.7}
            icon="ri-money-dollar-circle-line"
          />
        </div>
        <div className="row mt-4">
          <div className="col-xl-8">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Recent Milk Sales</h4>
                <RecentSalesTable />
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <MonthlySummary />
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-xl-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">
                  Milk Production vs Feed Consumption
                </h4>
                <AreaChart />
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Milk Sales vs Expenses</h4>
                <ColumnChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;