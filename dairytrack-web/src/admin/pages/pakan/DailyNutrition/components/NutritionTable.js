import Swal from "sweetalert2";
import { useCallback } from "react";

const NutritionTable = ({
  paginatedData,
  currentPage,
  totalPages,
  setCurrentPage,
  selectedCow,
  cowNames,
  nutrientMeta,
  itemsPerPage,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to format numbers: integers without decimals, decimals up to 2 places without trailing zeros
  const formatNumber = (value) => {
    return Number.isInteger(value)
      ? value.toString()
      : value.toFixed(2).replace(/\.?0+$/, "");
  };

  const showFeedDetails = useCallback(
    (item) => {
      if (!item || !item.sessions || item.sessions.length === 0) {
        Swal.fire({
          title: "Info",
          text: "Tidak ada detail pakan tersedia.",
          icon: "info",
        });
        return;
      }

      const feedSummary = {};
      item.sessions.forEach((session) => {
        if (session.DailyFeedItems && Array.isArray(session.DailyFeedItems)) {
          session.DailyFeedItems.forEach((feedItem) => {
            if (feedItem.Feed) {
              const feedName = feedItem.Feed.name;
              const quantity = parseFloat(feedItem.quantity) || 0;
              if (!feedSummary[feedName]) {
                feedSummary[feedName] = { quantity: 0, nutrients: {} };
              }
              feedSummary[feedName].quantity += quantity;

              if (
                feedItem.Feed.FeedNutrisiRecords &&
                Array.isArray(feedItem.Feed.FeedNutrisiRecords)
              ) {
                feedItem.Feed.FeedNutrisiRecords.forEach((record) => {
                  if (record.Nutrisi) {
                    const nutrientName = record.Nutrisi.name;
                    const amount = parseFloat(record.amount) || 0;
                    const totalNutrient = quantity * amount;
                    if (!feedSummary[feedName].nutrients[nutrientName]) {
                      feedSummary[feedName].nutrients[nutrientName] = 0;
                    }
                    feedSummary[feedName].nutrients[nutrientName] += totalNutrient;
                  }
                });
              }
            }
          });
        }
      });

      const feedItems = Object.entries(feedSummary).map(([name, data]) => ({
        name,
        quantity: formatNumber(data.quantity), // Format quantity
        nutrients: data.nutrients,
      }));

      if (feedItems.length === 0) {
        Swal.fire({
          title: "Info",
          text: "Tidak ada detail pakan tersedia.",
          icon: "info",
        });
        return;
      }

      const allNutrients = new Set();
      feedItems.forEach((f) => {
        Object.keys(f.nutrients).forEach((nutrient) => allNutrients.add(nutrient));
      });
      const nutrientList = Array.from(allNutrients);

      Swal.fire({
        title: `Detail Pakan - ${
          cowNames[selectedCow] || `Sapi #${selectedCow}`
        }`,
        html: `
          <div class="text-start">
            <p><strong>Tanggal:</strong> ${formatDate(item.date)}</p>
            <p><strong>Cuaca:</strong> ${item.weather || "-"}</p>
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Nama Pakan</th>
                  <th class="text-end">Jumlah (kg)</th>
                  ${nutrientList
                    .map(
                      (nutrient) =>
                        `<th class="text-end">${
                          nutrient.charAt(0).toUpperCase() + nutrient.slice(1)
                        } (${nutrientMeta[nutrient]?.unit || "unit"})</th>`
                    )
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${feedItems
                  .map(
                    (f) => `
                    <tr>
                      <td>${f.name}</td>
                      <td class="text-end">${f.quantity}</td>
                      ${nutrientList
                        .map((nutrient) => {
                          const value =
                            (f.nutrients[nutrient] || 0) *
                            (nutrientMeta[nutrient]?.multiplier || 1);
                          return `<td class="text-end">${formatNumber(value)}</td>`;
                        })
                        .join("")}
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `,
        width: "800px",
      });
    },
    [cowNames, selectedCow, nutrientMeta]
  );

  return (
    <>
      {selectedCow && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="card-title">
                Riwayat Nutrisi Harian
                {selectedCow && (
                  <span className="text-primary ms-2">
                    ({cowNames[selectedCow] || `Sapi #${selectedCow}`})
                  </span>
                )}
              </h4>
              <button className="btn btn-sm btn-primary">
                <i className="ri-download-2-line me-1"></i> Export
              </button>
            </div>
            {paginatedData.length === 0 ? (
              <div className="alert alert-info text-center">
                Tidak ada data nutrisi tersedia untuk filter yang dipilih.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-centered table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center">#</th>
                        <th>Tanggal</th>
                        <th>Cuaca</th>
                        {Object.keys(paginatedData[0]?.nutrients || {}).map(
                          (nutrient) => (
                            <th key={nutrient} className="text-center">
                              {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)} (
                              {nutrientMeta[nutrient]?.unit || "unit"})
                            </th>
                          )
                        )}
                        <th className="text-center">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item, index) => (
                        <tr key={item.date}>
                          <td className="text-center">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td>{formatDate(item.date)}</td>
                          <td>{item.weather || "-"}</td>
                          {Object.keys(item.nutrients || {}).map((nutrient) => {
                            const value =
                              (item.nutrients[nutrient] || 0) *
                              (nutrientMeta[nutrient]?.multiplier || 1);
                            const formattedValue = formatNumber(value);
                            return (
                              <td key={nutrient} className="text-center">
                                {formattedValue || "-"}
                              </td>
                            );
                          })}
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => showFeedDetails(item)}
                            >
                              <i className="ri-file-list-3-line"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li
                          className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <i className="ri-arrow-left-s-line"></i>
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li
                            key={i}
                            className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <i className="ri-arrow-right-s-line"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NutritionTable;
