import React, { useEffect, useState } from "react";
import {
  getAllFeedItems,
  deleteFeedItem,
} from "../../../../controllers/feedItemController";
import { getAllDailyFeeds } from "../../../../controllers/feedScheduleController";
import { listCows } from "../../../../controllers/cowsController";
import { listCowsByUser } from "../../../../controllers/cattleDistributionController";
import CreateDailyFeedItem from "./CreateDailyFeedItem";
import EditDailyFeedItem from "./EditDailyFeedItem";
import Swal from "sweetalert2";
import { Button, Card, Table, Spinner, Form, Modal, Pagination, ListGroup } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ListDailyFeedItem = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [cows, setCows] = useState([]);
  const [cowNames, setCowNames] = useState({});
  const [cowBirthDates, setCowBirthDates] = useState({});
  const [cowWeights, setCowWeights] = useState({});
  const [cowGenders, setCowGenders] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [exportModalShow, setExportModalShow] = useState(false);
  const [showNoFeedItemsModal, setShowNoFeedItemsModal] = useState(false); // New state for no feed items modal
  const [exportStartDate, setExportStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [exportEndDate, setExportEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isRestricted = ["supervisor", "admin"].includes(user?.role?.toLowerCase());
  const isFarmer = user?.role?.toLowerCase() === "farmer";

  const disableIfRestricted = isRestricted
    ? {
        disabled: true,
        title: "Admin atau Supervisor tidak dapat mengedit data",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedItemsResponse, dailyFeedsResponse, cowsData] =
        await Promise.all([
          getAllFeedItems().catch((err) => {
            console.error("Error fetching feed items:", err);
            return [];
          }),
          getAllDailyFeeds({ date: selectedDate }).catch((err) => {
            console.error("Error fetching daily feeds:", err);
            return { success: false, data: [] };
          }),
          (user?.role?.toLowerCase() === "farmer"
            ? listCowsByUser(user.user_id)
            : listCows()
          ).catch((err) => {
            console.error("Error fetching cows:", err);
            return { success: false, cows: [] };
          }),
        ]);

      const cowsArray = cowsData.success ? (cowsData.cows || []) : [];
      setCows(cowsArray);
      const allowedCowIds = new Set(cowsArray.map((cow) => cow.id));

      const dailyFeedsData = dailyFeedsResponse.success
        ? (dailyFeedsResponse.data || []).filter(
            (feed) => !user?.role?.toLowerCase() === "farmer" || allowedCowIds.has(feed.cow_id)
          )
        : [];
      setDailyFeeds(dailyFeedsData);

      const allowedDailyFeedIds = new Set(dailyFeedsData.map((feed) => feed.id));
      const feedItemsArray = Array.isArray(feedItemsResponse)
        ? feedItemsResponse.filter(
            (item) =>
              !user?.role?.toLowerCase() === "farmer" || allowedDailyFeedIds.has(item.daily_feed_id)
          )
        : (feedItemsResponse.data || []).filter(
            (item) =>
              !user?.role?.toLowerCase() === "farmer" || allowedDailyFeedIds.has(item.daily_feed_id)
          );
      setFeedItems(feedItemsArray);

      const cowMap = dailyFeedsData.length
        ? Object.fromEntries(
            dailyFeedsData.map((feed) => [
              feed.cow_id,
              feed.cow_name || `Sapi #${feed.cow_id}`,
            ])
          )
        : Object.fromEntries(
            cowsArray.map((cow) => [cow.id, cow.name || `Sapi #${cow.id}`])
          );
      const birthDateMap = cowsArray.length
        ? Object.fromEntries(
            cowsArray.map((cow) => [cow.id, cow.birth || null])
          )
        : {};
      const weightMap = cowsArray.length
        ? Object.fromEntries(
            cowsArray.map((cow) => [cow.id, cow.weight || "Tidak Diketahui"])
          )
        : {};
      const genderMap = cowsArray.length
        ? Object.fromEntries(
            cowsArray.map((cow) => [cow.id, cow.gender || "Tidak Diketahui"])
          )
        : {};

      setCowNames(cowMap);
      setCowBirthDates(birthDateMap);
      setCowWeights(weightMap);
      setCowGenders(genderMap);
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeedItems([]);
      setDailyFeeds([]);
      setCows([]);
      setCowNames({});
      setCowBirthDates({});
      setCowWeights({});
      setCowGenders({});
      Swal.fire("Error!", "Gagal memuat data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.token || !user.user_id || !user.role) {
      localStorage.removeItem("user");
      window.location.href = "/";
    } else {
      fetchData();
    }
  }, [selectedDate]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return "Tidak Diketahui";
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (now.getDate() < birth.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    return `${years} tahun ${months} bulan`;
  };

  const groupedFeedItems = dailyFeeds.reduce((acc, dailyFeed) => {
    const cowName = cowNames[dailyFeed.cow_id] || `Sapi #${dailyFeed.cow_id}`;
    const cowAge = calculateAge(cowBirthDates[dailyFeed.cow_id]);
    const cowGender = cowGenders[dailyFeed.cow_id] || "Tidak Diketahui";
    const cowWeight = cowWeights[dailyFeed.cow_id] || "Tidak Diketahui";
    const key = `${dailyFeed.cow_id}-${dailyFeed.date}-${dailyFeed.session}`;
    const items = feedItems.filter((item) => item.daily_feed_id === dailyFeed.id);

    acc[key] = {
      cow_id: dailyFeed.cow_id,
      date: dailyFeed.date,
      cow: cowName,
      age: cowAge,
      gender: cowGender,
      berat: cowWeight,
      sesi: dailyFeed.session,
      weather: dailyFeed.weather || "Tidak Ada",
      items: items,
      daily_feed_id: dailyFeed.id, // Added for edit action in no feed items modal
    };

    return acc;
  }, {});

  // New logic: Identify cows with schedules that have no feed items
  const cowsWithNoFeedItems = Object.values(groupedFeedItems)
    .filter((group) => !group.items || group.items.length === 0)
    .map((group) => ({
      cow_id: group.cow_id,
      cow_name: group.cow,
      date: group.date,
      session: group.sesi,
      daily_feed_id: group.daily_feed_id,
    }));

  const filteredFeedItems = Object.values(groupedFeedItems).filter((group) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      group.date.toLowerCase().includes(searchLower) ||
      group.cow.toLowerCase().includes(searchLower) ||
      group.age.toLowerCase().includes(searchLower) ||
      group.gender.toLowerCase().includes(searchLower) ||
      group.berat.toString().toLowerCase().includes(searchLower) ||
      group.sesi.toLowerCase().includes(searchLower) ||
      group.weather.toLowerCase().includes(searchLower) ||
      group.items.some(
        (item) =>
          (item.Feed?.name || item.feed_name || "").toLowerCase().includes(searchLower) ||
          (item.quantity?.toString() || "").includes(searchLower)
      )
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID");
    } catch (error) {
      return dateString;
    }
  };

  const handleDeleteClick = async (group, session) => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: `Apakah Anda yakin ingin menghapus data pakan untuk sapi ${group.cow} pada tanggal ${group.date} sesi ${group.sesi}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const items = group.items;
        if (items && items.length > 0) {
          await Promise.all(items.map((item) => deleteFeedItem(item.id)));
          Swal.fire({
            title: "Berhasil!",
            text: "Data pakan harian telah dihapus.",
            icon: "success",
            timer: 1500,
          });
        } else {
          Swal.fire({
            title: "Perhatian",
            text: "Tidak ada item pakan untuk dihapus.",
            icon: "info",
            timer: 1500,
          });
        }
        fetchData();
      } catch (error) {
        console.error("Gagal menghapus data pakan:", error.message);
        Swal.fire(
          "Error!",
          "Terjadi kesalahan saat menghapus: " + error.message,
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = async (format) => {
    setExportModalShow(false);
    const start = new Date(exportStartDate).toISOString().split("T")[0];
    const end = new Date(exportEndDate).toISOString().split("T")[0];

    try {
      setLoading(true);
      const [feedItemsResponse, dailyFeedsResponse, cowsData] = await Promise.all([
        getAllFeedItems({ start_date: start, end_date: end }),
        getAllDailyFeeds(),
        user?.role?.toLowerCase() === "farmer" ? listCowsByUser(user.user_id) : listCows(),
      ]);

      if (!feedItemsResponse.success || !dailyFeedsResponse.success || !cowsData.success) {
        throw new Error("Gagal mengambil data untuk ekspor");
      }

      const apiData = feedItemsResponse.data || [];
      const dailyFeedsData = dailyFeedsResponse.data || [];
      const cowsArray = cowsData.cows || [];

      const cowMap = Object.fromEntries(
        cowsArray.map((cow) => [cow.id, cow.name || `Sapi #${cow.id}`])
      );
      const birthDateMap = Object.fromEntries(
        cowsArray.map((cow) => [cow.id, cow.birth || null])
      );
      const weightMap = Object.fromEntries(
        cowsArray.map((cow) => [cow.id, cow.weight ? `${cow.weight} kg` : "Tidak Diketahui"])
      );
      const genderMap = Object.fromEntries(
        cowsArray.map((cow) => [cow.id, cow.gender || "Tidak Diketahui"])
      );

      const mappedData = apiData
        .filter((item) => {
          const dailyFeed = dailyFeedsData.find((df) => df.id === item.daily_feed_id);
          if (!dailyFeed) return false;
          const itemDate = new Date(dailyFeed.date).toISOString().split("T")[0];
          return itemDate >= start && itemDate <= end;
        })
        .map((item) => {
          const dailyFeed = dailyFeedsData.find((df) => df.id === item.daily_feed_id) || {};
          return {
            ...item,
            date: dailyFeed.date || item.created_at?.split("T")[0] || "Tidak Diketahui",
            sesi: dailyFeed.session || "Tidak Diketahui",
            weather: dailyFeed.weather || "Tidak Ada",
            sapi: cowMap[dailyFeed.cow_id] || `Sapi #${dailyFeed.cow_id || "Unknown"}`,
            usia: calculateAge(birthDateMap[dailyFeed.cow_id]) || "Tidak Diketahui",
            gender: genderMap[dailyFeed.cow_id] || "Tidak Diketahui",
            berat: weightMap[dailyFeed.cow_id] || "Tidak Diketahui",
          };
        });

      if (mappedData.length === 0) {
        throw new Error("Tidak ada data yang tersedia untuk rentang tanggal yang dipilih.");
      }

      const groupedExportData = mappedData.reduce((acc, item) => {
        const key = `${item.daily_feed_id}-${item.date}`;
        if (!acc[key]) {
          acc[key] = {
            tanggal: formatDate(item.date),
            sapi: item.sapi,
            usia: item.usia,
            gender: item.gender,
            berat: item.berat,
            sesi: item.sesi,
            cuaca: item.weather,
            items: [],
          };
        }
        acc[key].items.push({
          feed_name: item.feed_name || "Tidak Diketahui",
          quantity: `${item.quantity || 0} kg`,
        });
        return acc;
      }, {});

      const exportData = Object.values(groupedExportData).map((group) => {
        const feedColumns = group.items.reduce(
          (acc, item, index) => ({
            ...acc,
            [`pakan${index + 1}`]: item.feed_name,
            [`jumlah_pakan${index + 1}`]: item.quantity,
          }),
          {}
        );
        return {
          ...group,
          ...feedColumns,
        };
      });

      if (format === "pdf") {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        doc.setFontSize(18);
        doc.text("Laporan Item Pakan Harian", 10, 15);
        doc.setFontSize(12);
        doc.text(`Periode: ${start} hingga ${end}`, 10, 25);
        doc.setFontSize(10);

        const maxItems = Math.max(...exportData.map((d) => d.items.length));
        const headers = [
          "Tanggal",
          "Sapi",
          "Usia",
          "Gender",
          "Berat",
          "Sesi",
          "Cuaca",
          ...Array(maxItems)
            .fill()
            .map((_, index) => [`Pakan ${index + 1}`, `Jumlah Pakan ${index + 1}`])
            .flat(),
        ];
        const body = exportData.map((row) => [
          row.tanggal,
          row.sapi,
          row.usia,
          row.gender,
          row.berat,
          row.sesi,
          row.cuaca,
          ...Array(maxItems)
            .fill()
            .map((_, index) => [
              row[`pakan${index + 1}`] || "-",
              row[`jumlah_pakan${index + 1}`] || "-",
            ])
            .flat(),
        ]);

        autoTable(doc, {
          head: [headers],
          body: body,
          startY: 35,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontSize: 10 },
          styles: { cellPadding: 2, fontSize: 8, halign: "center" },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
            6: { cellWidth: 20 },
            ...Object.fromEntries(
              headers.slice(7).map((_, i) => [i + 7, { cellWidth: 25 }])
            ),
          },
        });

        doc.save(`feed_items_${start}_to_${end}.pdf`);
      } else if (format === "excel") {
        const maxItems = Math.max(...exportData.map((d) => d.items.length));
        const worksheetData = exportData.map((row) => {
          const dataRow = {
            Tanggal: row.tanggal,
            Sapi: row.sapi,
            Usia: row.usia,
            Gender: row.gender,
            Berat: row.berat,
            Sesi: row.sesi,
            Cuaca: row.cuaca,
          };
          for (let i = 0; i < maxItems; i++) {
            dataRow[`Pakan ${i + 1}`] = row[`pakan${i + 1}`] || "-";
            dataRow[`Jumlah Pakan ${i + 1}`] = row[`jumlah_pakan${i + 1}`] || "-";
          }
          return dataRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        worksheet["!cols"] = [
          { wch: 15 },
          { wch: 20 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          ...Array(maxItems * 2)
            .fill()
            .map(() => ({ wch: 20 })),
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Feed Items");
        XLSX.writeFile(workbook, `feed_items_${start}_to_${end}.xlsx`);
      }

      Swal.fire({
        title: "Berhasil!",
        text: `Data berhasil diekspor ke ${format === "pdf" ? "PDF" : "Excel"}`,
        icon: "success",
        timer: 1500,
      });
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      Swal.fire("Error!", `Terjadi kesalahan saat mengekspor ke ${format}: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-primary text-white py-3">
          <h4 className="mb-0 fw-bold">
            <i className="fas fa-utensils me-2" /> Data Item Pakan Harian
          </h4>
        </Card.Header>

        <Card.Body>
          <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap">
            <Form.Group className="me-3 mb-2">
              <Form.Label>Pilih Tanggal</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>
            <Form.Group className="me-3 mb-2">
              <Form.Label>Cari</Form.Label>
              <Form.Control
                type="text"
                placeholder="Cari nama sapi, cuaca, dll."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
            <div className="mb-2">
              {!isRestricted && (
                <Button
                  variant="primary"
                  onClick={() => setModalType("create")}
                  {...disableIfRestricted}
                >
                  <i className="fas fa-plus me-2" /> Tambah Item Pakan
                </Button>
              )}
              <Button
                variant="success"
                className="ms-2"
                onClick={() => setExportModalShow(true)}
              >
                <i className="fas fa-download me-2" /> Ekspor
              </Button>
              <Button
                variant="warning"
                className="ms-2"
                onClick={() => setShowNoFeedItemsModal(true)}
              >
                <i className="fas fa-exclamation-triangle me-2" /> Sapi Tanpa Item Pakan
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Memuat data pakan harian...</p>
            </div>
          ) : filteredFeedItems.length === 0 ? (
            <p className="text-center text-muted py-4">
              {searchQuery
                ? "Tidak ada data yang sesuai dengan pencarian Anda."
                : "Tidak ada data pakan harian untuk tanggal ini."}
            </p>
          ) : (
            <>
              <div className="table-responsive">
                {Object.keys(cowNames).length === 0 && (
                  <div className="alert alert-warning mb-3">
                    <i className="fas fa-exclamation-triangle me-2" /> Data nama
                    sapi tidak tersedia. Nama sapi ditampilkan sebagai ID.
                  </div>
                )}
                <Table bordered hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Nama Sapi</th>
                      <th>Tanggal</th>
                      <th>Sesi</th>
                      <th>Pakan</th>
                      <th>Cuaca</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((group, index) => (
                      <tr key={`${group.cow_id}-${group.date}-${group.sesi}-${index}`}>
                        <td>{group.cow}</td>
                        <td>{formatDate(group.date)}</td>
                        <td>{group.sesi}</td>
                        <td>
                          {group.items.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                              {group.items.map((feedItem, itemIdx) => (
                                <div
                                  key={itemIdx}
                                  className="border rounded p-2 bg-light"
                                  style={{ minWidth: "100px" }}
                                >
                                  <div className="fw-medium">
                                    {feedItem.Feed?.name || feedItem.feed_name || "-"}
                                  </div>
                                  <div className="text-muted">
                                    {feedItem.quantity} kg
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">Belum Ada Pakan</span>
                          )}
                        </td>
                        <td>{group.weather}</td>
                        <td>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2"
                            onClick={() => {
                              if (!isRestricted && group.items.length > 0) {
                                setEditId(group.items[0].daily_feed_id);
                                setModalType("edit");
                              }
                            }}
                            disabled={isRestricted || group.items.length === 0}
                            {...disableIfRestricted}
                          >
                            <i className="fas fa-edit" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => !isRestricted && handleDeleteClick(group, group.sesi)}
                            disabled={isRestricted || group.items.length === 0}
                            {...disableIfRestricted}
                          >
                            <i className="fas fa-trash" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Pagination className="justify-content-center mt-3">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages).keys()].map((page) => (
                  <Pagination.Item
                    key={page + 1}
                    active={page + 1 === currentPage}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    {page + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </>
          )}
        </Card.Body>
      </Card>

      {modalType === "create" && (
        <CreateDailyFeedItem
          dailyFeeds={dailyFeeds}
          defaultDate={selectedDate}
          onFeedItemAdded={() => {
            fetchData();
            setModalType(null);
          }}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "edit" && editId && (
        <EditDailyFeedItem
          dailyFeedId={editId}
          onUpdateSuccess={() => {
            fetchData();
            setModalType(null);
            setEditId(null);
          }}
          onClose={() => {
            setModalType(null);
            setEditId(null);
          }}
        />
      )}

      <Modal
        show={exportModalShow}
        onHide={() => setExportModalShow(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fw-bold">Pilih Rentang Tanggal untuk Ekspor</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal Mulai</Form.Label>
              <Form.Control
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal Selesai</Form.Label>
              <Form.Control
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setExportModalShow(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={() => handleExport("pdf")}>
            Ekspor ke PDF
          </Button>
          <Button variant="success" onClick={() => handleExport("excel")}>
            Ekspor ke Excel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Modal for Cows with No Feed Items */}
      <Modal
        show={showNoFeedItemsModal}
        onHide={() => setShowNoFeedItemsModal(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sapi dengan Jadwal Tanpa Item Pakan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cowsWithNoFeedItems.length === 0 ? (
            <p className="text-center text-muted">
              {dailyFeeds.length === 0
                ? "Tidak ada jadwal pakan untuk tanggal ini."
                : "Semua jadwal pakan memiliki item pakan untuk tanggal ini."}
            </p>
          ) : (
            <ListGroup>
              {cowsWithNoFeedItems.map((cow) => (
                <ListGroup.Item key={cow.cow_id} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{cow.cow_name}</strong>
                    <span className="badge bg-warning text-dark">
                      Sesi: {cow.session}, Tanggal: {formatDate(cow.date)}
                    </span>
                  </div>
                  {isFarmer && (
                    <div className="mt-2">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => {
                          setEditId(cow.daily_feed_id);
                          setModalType("edit");
                          setShowNoFeedItemsModal(false);
                        }}
                      >
                        Edit Jadwal {cow.session}
                      </Button>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoFeedItemsModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListDailyFeedItem;