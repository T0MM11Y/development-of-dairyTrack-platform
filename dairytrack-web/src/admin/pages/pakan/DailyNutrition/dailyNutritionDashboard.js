import { useState, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import FilterSection from "./components/FilterSection";
import SummaryCards from "./components/SummaryCards";
import NutritionTable from "./components/NutritionTable";
import NutritionCharts from "./components/nutritionCharts";

// Main component orchestrating the dashboard
const FeedNutritionSummaryPage = () => {
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cowNames, setCowNames] = useState({});
  const [selectedCow, setSelectedCow] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data for feeds and cows
  const fetchData = useCallback(
    async (abortController) => {
      try {
        setLoading(true);
        const params = {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          cow_id: selectedCow || undefined,
        };

        const [feedsResponse, cowsResponse] = await Promise.all([
          getAllDailyFeeds(params, { signal: abortController.signal }),
          getCows().catch((err) => {
            console.error("Failed to fetch cows:", err);
            return [];
          }),
        ]);

        if (feedsResponse.success && feedsResponse.data) {
          setNutritionData(feedsResponse.data);
        } else {
          console.error("Unexpected feeds response:", feedsResponse);
          setNutritionData([]);
        }

        const cowMap = {};
        cowsResponse.forEach((cow) => {
          cowMap[cow.id] = cow.name;
        });
        setCowNames(cowMap);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to fetch data:", error.message);
        setNutritionData([]);
        Swal.fire({
          title: "Error!",
          text: "Gagal memuat data nutrisi.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [dateRange.startDate, dateRange.endDate, selectedCow]
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController);
    return () => {
      abortController.abort();
      setNutritionData([]);
    };
  }, [fetchData]);

  // Filter data based on date range and selected cow
  const filteredData = useMemo(() => {
    return nutritionData.filter((item) => {
      const dateMatch =
        new Date(item.date) >= new Date(dateRange.startDate) &&
        new Date(item.date) <= new Date(dateRange.endDate);
      const cowMatch = selectedCow
        ? item.cow_id.toString() === selectedCow
        : true;
      return dateMatch && cowMatch;
    });
  }, [nutritionData, dateRange.startDate, dateRange.endDate, selectedCow]);

  // Get unique cows for filter dropdown
  const uniqueCows = useMemo(() => {
    return [...new Set(nutritionData.map((item) => item.cow_id))];
  }, [nutritionData]);

  // Collect nutrient metadata (name and unit)
  const nutrientMeta = useMemo(() => {
    const meta = {};
    filteredData.forEach((item) => {
      if (item.DailyFeedItems && Array.isArray(item.DailyFeedItems)) {
        item.DailyFeedItems.forEach((feedItem) => {
          if (feedItem.Feed && feedItem.Feed.FeedNutrisiRecords) {
            feedItem.Feed.FeedNutrisiRecords.forEach((record) => {
              if (record.Nutrisi) {
                const name = record.Nutrisi.name;
                const unit = record.Nutrisi.unit;
                if (!meta[name]) {
                  meta[name] = {
                    unit,
                    multiplier: name === "protein" ? 0.001 : 1, // mg to g for protein
                    icon:
                      {
                        protein: "🍖",
                        energy: "⚡",
                        serat: "🌿",
                        vitamin: "💊",
                      }[name] || "📊",
                    color:
                      {
                        protein: "primary",
                        energy: "success",
                        serat: "warning",
                        vitamin: "danger",
                      }[name] || "info",
                  };
                }
              }
            });
          }
        });
      }
    });
    return meta;
  }, [filteredData]);

  // Process data for charts and tables
  const chartData = useMemo(() => {
    if (!selectedCow || filteredData.length === 0) return [];

    const groupedByDate = {};
    filteredData.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          fullDate: item.date,
          nutrients: {},
          sessions: [],
        };
      }

      const sessionNutrients = {};
      if (item.DailyFeedItems && Array.isArray(item.DailyFeedItems)) {
        item.DailyFeedItems.forEach((feedItem) => {
          if (feedItem.Feed && feedItem.Feed.FeedNutrisiRecords) {
            const quantity = parseFloat(feedItem.quantity) || 0;
            feedItem.Feed.FeedNutrisiRecords.forEach((record) => {
              if (record.Nutrisi) {
                const nutrientName = record.Nutrisi.name;
                const amount = parseFloat(record.amount) || 0;
                const totalNutrient = quantity * amount;

                if (!sessionNutrients[nutrientName]) {
                  sessionNutrients[nutrientName] = 0;
                }
                sessionNutrients[nutrientName] += totalNutrient;
              }
            });
          }
        });
      }

      Object.entries(sessionNutrients).forEach(([nutrient, value]) => {
        if (!groupedByDate[date].nutrients[nutrient]) {
          groupedByDate[date].nutrients[nutrient] = 0;
        }
        groupedByDate[date].nutrients[nutrient] += value;
      });

      groupedByDate[date].sessions.push({
        session: item.session,
        nutrients: sessionNutrients,
        dailyFeedItems: item.DailyFeedItems,
      });
    });

    return Object.values(groupedByDate).sort(
      (a, b) => new Date(a.fullDate) - new Date(b.fullDate)
    );
  }, [filteredData, selectedCow]);

  // Process data for paginated table
  const paginatedData = useMemo(() => {
    const groupedByDate = {};
    filteredData.forEach((item) => {
      const date = new Date(item.date).toISOString().split("T")[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          nutrients: {},
          sessions: [],
          weather: item.weather,
        };
      }

      const sessionNutrients = {};
      if (item.DailyFeedItems && Array.isArray(item.DailyFeedItems)) {
        item.DailyFeedItems.forEach((feedItem) => {
          if (feedItem.Feed && feedItem.Feed.FeedNutrisiRecords) {
            const quantity = parseFloat(feedItem.quantity) || 0;
            feedItem.Feed.FeedNutrisiRecords.forEach((record) => {
              if (record.Nutrisi) {
                const nutrientName = record.Nutrisi.name;
                const amount = parseFloat(record.amount) || 0;
                const totalNutrient = quantity * amount;

                if (!sessionNutrients[nutrientName]) {
                  sessionNutrients[nutrientName] = 0;
                }
                sessionNutrients[nutrientName] += totalNutrient;
              }
            });
          }
        });
      }

      Object.entries(sessionNutrients).forEach(([nutrient, value]) => {
        if (!groupedByDate[date].nutrients[nutrient]) {
          groupedByDate[date].nutrients[nutrient] = 0;
        }
        groupedByDate[date].nutrients[nutrient] += value;
      });

      groupedByDate[date].sessions.push(item);
    });

    Object.values(groupedByDate).forEach((item) => {
      Object.keys(nutrientMeta).forEach((nutrient) => {
        if (!item.nutrients[nutrient]) {
          item.nutrients[nutrient] = 0;
        }
      });
    });

    const dailyData = Object.values(groupedByDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const start = (currentPage - 1) * itemsPerPage;
    return dailyData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, nutrientMeta]);

  const totalPages = Math.ceil(
    Object.keys(
      filteredData.reduce((acc, item) => {
        acc[new Date(item.date).toISOString().split("T")[0]] = true;
        return acc;
      }, {})
    ).length / itemsPerPage
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Ringkasan Nutrisi Pakan
          </h2>
          <p className="text-muted">Analisis nutrisi pakan harian sapi</p>
        </div>
        <button
          onClick={() => fetchData(new AbortController())}
          className="btn btn-secondary waves-effect waves-light"
          disabled={loading}
        >
          <i className="ri-refresh-line me-1"></i> Refresh
        </button>
      </div>

      <FilterSection
        uniqueCows={uniqueCows}
        cowNames={cowNames}
        selectedCow={selectedCow}
        setSelectedCow={setSelectedCow}
        dateRange={dateRange}
        setDateRange={setDateRange}
        loading={loading}
        handleApplyFilters={() => {
          if (!selectedCow) {
            Swal.fire({
              title: "Perhatian!",
              text: "Silakan pilih sapi terlebih dahulu untuk melihat grafik.",
              icon: "warning",
            });
            return;
          }
          if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
            Swal.fire({
              title: "Perhatian!",
              text: "Tanggal mulai harus sebelum tanggal akhir.",
              icon: "warning",
            });
            return;
          }
          fetchData(new AbortController());
        }}
      />

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data nutrisi...</p>
        </div>
      ) : (
        <>
          <NutritionCharts
            chartData={chartData}
            selectedCow={selectedCow}
            cowNames={cowNames}
            nutrientMeta={nutrientMeta}
          />
          <SummaryCards
            chartData={chartData}
            filteredData={filteredData}
            selectedCow={selectedCow}
            nutrientMeta={nutrientMeta}
          />
          <NutritionTable
            paginatedData={paginatedData}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            selectedCow={selectedCow}
            cowNames={cowNames}
            nutrientMeta={nutrientMeta}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  );
};

export default FeedNutritionSummaryPage;
