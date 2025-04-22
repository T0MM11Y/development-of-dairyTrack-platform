import React, { useState, useEffect } from "react";
import TotalMilkProductionCard from "../../components/Charts/TotalMilkProductionCard";
import HealthyCowsCard from "../../components/Charts/HealthyCowsCard";
import FeedStockCard from "../../components/Charts/FeedStockCard";
import MonthlyRevenueCard from "../../components/Charts/MonthlyRevenueCard";
import RecentMilkSalesCard from "../../components/Charts/RecentMilkSalesCard";
import MonthlySummaryCard from "../../components/Charts/MonthlySummaryCard";
import MilkProductionVsFeedChart from "../../components/Charts/MilkProductionVsFeedChart";
import MilkSalesVsExpensesChart from "../../components/Charts/MilkSalesVsExpensesChart";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      if (hours >= 5 && hours < 12) {
        setGreeting("Good Morning");
      } else if (hours >= 12 && hours < 17) {
        setGreeting("Good Afternoon");
      } else if (hours >= 17 && hours < 21) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }

      const formattedTime = now.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="">
      <div className="current-time" style={{ display: "flex", alignItems: "center" }}>
        <p
          style={{
            marginTop: "1rem",
            fontSize: "1.4rem",
            marginLeft: "2.5rem",
            textAlign: "start",
            fontFamily: "'Dancing Script', cursive",
            marginRight: "1.5rem",
          }}
        >
          {greeting}
        </p>
        <p
          style={{
            fontWeight: "italic",
            marginTop: "1rem",
            fontSize: "1.3rem",
            marginLeft: "1.5rem",
            textAlign: "start",
            background: "linear-gradient(to right, #366DD4FF, #29A9E4FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Consolas', cursive",
          }}
        >
          {currentTime}
        </p>
      </div>
      <div className="row">
        <TotalMilkProductionCard />
        <HealthyCowsCard />
        <FeedStockCard />
        <MonthlyRevenueCard />
      </div>
      <div className="row">
        <div className="col-xl-8">
          <RecentMilkSalesCard />
        </div>
        <div className="col-xl-4">
          <MonthlySummaryCard />
        </div>
      </div>
      <div className="row">
        <div className="col-xl-6">
          <MilkProductionVsFeedChart />
        </div>
        <div className="col-xl-6">
          <MilkSalesVsExpensesChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;