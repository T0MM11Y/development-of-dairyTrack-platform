import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const Card = ({ title, value, percentage, icon }) => {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="card">
        <div className="card-body">
          <div className="d-flex">
            <div className="flex-grow-1">
              <p className="text-truncate font-size-14 mb-2">{title}</p>
              <h4 className="mb-2">{value}</h4>
              <p className="text-muted mb-0">
                <span
                  className={`text-${
                    percentage >= 0 ? "success" : "danger"
                  } fw-bold font-size-12 me-2`}
                >
                  <i
                    className={`ri-arrow-right-${
                      percentage >= 0 ? "up" : "down"
                    }-line me-1 align-middle`}
                  ></i>
                  {Math.abs(percentage)}%
                </span>
                from previous period
              </p>
            </div>
            <div className="avatar-sm">
              <span className="avatar-title bg-light text-primary rounded-3">
                <i className={`${icon} font-size-24`}></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Content = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      // Tentukan ucapan berdasarkan jam
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

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const areaChartOptions = {
    series: [
      {
        name: "Milk Production",
        data: [3100, 3400, 2800, 3500, 3200, 3900, 4100],
      },
      {
        name: "Feed Consumption",
        data: [2100, 2300, 2500, 2200, 2400, 2600, 2800],
      },
    ],
    chart: { height: 350, type: "area" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: {
      type: "datetime",
      categories: [
        "2023-05-01T00:00:00.000Z",
        "2023-05-02T00:00:00.000Z",
        "2023-05-03T00:00:00.000Z",
        "2023-05-04T00:00:00.000Z",
        "2023-05-05T00:00:00.000Z",
        "2023-05-06T00:00:00.000Z",
        "2023-05-07T00:00:00.000Z",
      ],
    },
    tooltip: { x: { format: "dd/MM/yy" } },
  };

  const columnChartOptions = {
    series: [
      {
        name: "Milk Sales",
        data: [44000, 55000, 57000, 56000, 61000, 58000, 63000, 60000, 66000],
      },
      {
        name: "Expenses",
        data: [
          76000, 85000, 101000, 98000, 87000, 105000, 91000, 114000, 94000,
        ],
      },
    ],
    chart: { type: "bar", height: 350 },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%", endingShape: "rounded" },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
      ],
    },
    yaxis: { title: { text: "$ (dollars)" } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => `$ ${val}` } },
  };

  return (
    <div className="">
      <div
        className="current-time"
        style={{ display: "flex", alignItems: "center" }}
      >
        <p
          style={{
            marginTop: "1rem",
            fontSize: "1.4rem",

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
            background: "linear-gradient(to right, #368BD4FF, #29DAE4FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Consolas', cursive",
          }}
        >
          {currentTime}
        </p>
      </div>
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
      {/* Latest Transactions */}
      <div className="row">
        <div className="col-xl-8">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-4">Recent Milk Sales</h4>
              <div className="table-responsive">
                <table className="table table-centered mb-0 align-middle table-hover table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Quantity (L)</th>
                      <th>Quality</th>
                      <th>Price/L</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[].map((sale, index) => (
                      <tr key={index}>
                        <td>{sale[0]}</td>
                        <td>{sale[1]}</td>
                        <td>{sale[2]}</td>
                        <td>${sale[3].toFixed(2)}</td>
                        <td>${(sale[1] * sale[3]).toFixed(2)}</td>
                        <td>
                          <div className="font-size-13">
                            <i className="ri-checkbox-blank-circle-fill font-size-10 text-success align-middle me-2"></i>
                            {sale[4]}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {/* Monthly Summary */}
        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-4">Monthly Summary</h4>
              <div className="row">
                <div className="col-4 text-center">
                  <h5>34,750 L</h5>
                  <p className="mb-2 text-truncate">Milk Produced</p>
                </div>
                <div className="col-4 text-center">
                  <h5>$20,158</h5>
                  <p className="mb-2 text-truncate">Revenue</p>
                </div>
                <div className="col-4 text-center">
                  <h5>26,200 kg</h5>
                  <p className="mb-2 text-truncate">Feed Used</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-4">
                Milk Production vs Feed Consumption
              </h4>
              <ReactApexChart
                options={areaChartOptions}
                series={areaChartOptions.series}
                type="area"
                height={350}
              />
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-4">Milk Sales vs Expenses</h4>
              <ReactApexChart
                options={columnChartOptions}
                series={columnChartOptions.series}
                type="bar"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
