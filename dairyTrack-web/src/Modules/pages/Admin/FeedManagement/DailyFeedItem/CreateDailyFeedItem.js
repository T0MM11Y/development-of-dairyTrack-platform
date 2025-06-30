import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, ListGroup } from "react-bootstrap";
import { addFeedItem } from "../../../../controllers/feedItemController";
import { listFeeds } from "../../../../controllers/feedController";
import { getAllFeedStocks } from "../../../../controllers/feedStockController";
import Swal from "sweetalert2";

const CreateDailyFeedItem = ({ dailyFeeds, onFeedItemAdded, onClose, defaultDate }) => {
  const [dailyFeedId, setDailyFeedId] = useState("");
  const [selectedFeeds, setSelectedFeeds] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [newFeedId, setNewFeedId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to format numbers without trailing zeros
  const formatNumber = (number) => {
    if (Number.isNaN(number) || number === null || number === undefined) return "0";
    const num = parseFloat(number);
    return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
  };

  useEffect(() => {
    const fetchFeedsAndStocks = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = user.token || null;
        console.log("fetchFeedsAndStocks - Token:", token);
        if (!token) {
          localStorage.removeItem("user");
          window.location.href = "/";
          return;
        }

        const [feedResponse, stockResponse] = await Promise.all([
          listFeeds(),
          getAllFeedStocks(),
        ]);

        console.log("CreateDailyFeedItem - Feeds Response:", JSON.stringify(feedResponse, null, 2));
        console.log("CreateDailyFeedItem - Stocks Response:", JSON.stringify(stockResponse, null, 2));

        if (!feedResponse.success || !Array.isArray(feedResponse.feeds)) {
          console.error("Invalid feed response:", feedResponse);
          setError("Gagal memuat daftar pakan: Data tidak valid.");
          setFeeds([]);
          return;
        }

        if (!stockResponse.success || !Array.isArray(stockResponse.data)) {
          console.error("Invalid stock response:", stockResponse);
          setError("Gagal memuat data stok pakan: Data tidak valid.");
          setFeeds([]);
          return;
        }

        const feedsWithStock = feedResponse.feeds
          .map((feed) => {
            const stockData = stockResponse.data.find((s) => String(s.id) === String(feed.id));
            console.log(`Matching Feed ID: ${feed.id}, Stock Data:`, stockData);

            let stockValue = 0;
            let unitValue = feed.unit || "kg";

            if (stockData && stockData.stock) {
              stockValue = parseFloat(stockData.stock.stock) || 0;
              unitValue = stockData.stock.unit || unitValue;
            } else {
              console.warn(`No valid stock for feed ID ${feed.id}`);
            }

            return {
              id: feed.id,
              name: feed.name || feed.type_name || `Feed #${feed.id}`,
              stock: stockValue,
              unit: unitValue,
            };
          })
          .filter((feed) => feed.stock > 0); // Only include feeds with stock

        console.log("CreateDailyFeedItem - Feeds with Stock:", JSON.stringify(feedsWithStock, null, 2));
        setFeeds(feedsWithStock);

        if (feedsWithStock.length === 0) {
          setError("Tidak ada pakan dengan stok tersedia.");
        }
      } catch (err) {
        console.error("CreateDailyFeedItem - Fetch Error:", err);
        setError("Gagal memuat data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedsAndStocks();
  }, []);

  const availableFeeds = feeds.filter(
    (feed) => !selectedFeeds.some((selected) => selected.feedId === feed.id)
  );

  const handleAddFeed = () => {
    if (!newFeedId || !newQuantity || parseFloat(newQuantity) <= 0) {
      setError("Pilih pakan dan masukkan jumlah yang valid.");
      return;
    }

    const feed = feeds.find((f) => f.id === parseInt(newFeedId));
    if (!feed) {
      setError("Pakan tidak ditemukan.");
      return;
    }

    const availableStock = parseFloat(feed.stock || 0);
    const requestedQuantity = parseFloat(newQuantity);
    console.log("handleAddFeed - Feed:", feed, "Requested Quantity:", requestedQuantity, "Available Stock:", availableStock);

    if (availableStock === 0) {
      setError(`Tidak ada stok tersedia untuk ${feed.name}.`);
      return;
    }
    if (requestedQuantity > availableStock) {
      setError(`Jumlah melebihi stok tersedia: ${formatNumber(availableStock)} ${feed.unit}.`);
      return;
    }

    setSelectedFeeds((prev) => [
      ...prev,
      { feedId: parseInt(newFeedId), quantity: requestedQuantity },
    ]);
    setNewFeedId("");
    setNewQuantity("");
    setError(null);
  };

  const handleRemoveFeed = (feedId) => {
    setSelectedFeeds((prev) => prev.filter((item) => item.feedId !== feedId));
    setError(null);
  };

  const handleQuantityChange = (feedId, value) => {
    const quantity = parseFloat(value);
    if (isNaN(quantity) || quantity <= 0) {
      setError("Masukkan jumlah yang valid.");
      return;
    }

    const feed = feeds.find((f) => f.id === feedId);
    if (!feed) {
      setError("Pakan tidak ditemukan.");
      return;
    }

    const availableStock = parseFloat(feed.stock || 0);
    console.log("handleQuantityChange - Feed:", feed, "New Quantity:", quantity, "Available Stock:", availableStock);

    if (availableStock === 0) {
      setError(`Tidak ada stok tersedia untuk ${feed.name}.`);
      return;
    }
    if (quantity > availableStock) {
      setError(`Jumlah melebihi stok tersedia: ${formatNumber(availableStock)} ${feed.unit}.`);
      return;
    }

    setSelectedFeeds((prev) =>
      prev.map((item) =>
        item.feedId === feedId ? { ...item, quantity } : item
      )
    );
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dailyFeedId || selectedFeeds.length === 0) {
      Swal.fire("Error", "Pilih sesi pakan dan tambahkan setidaknya satu pakan.", "error");
      return;
    }

    const feedItems = selectedFeeds.map((item) => ({
      feed_id: item.feedId,
      quantity: item.quantity,
    }));

    try {
      setLoading(true);
      const response = await addFeedItem({ daily_feed_id: dailyFeedId, feed_items: feedItems });
      console.log("handleSubmit - Response:", response);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: response.message || "Item pakan berhasil ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
        onFeedItemAdded();
        onClose();
      } else {
        Swal.fire("Error", response.message || "Gagal menambahkan item pakan.", "error");
      }
    } catch (err) {
      console.error("handleSubmit - Error:", err);
      Swal.fire("Error", err.message || "Gagal menambahkan item pakan.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="fw-bold">Tambah Item Pakan</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Memuat...</span>
            </div>
            <p>Memuat data pakan...</p>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Pilih Sesi Pakan</Form.Label>
                <Form.Select
                  value={dailyFeedId}
                  onChange={(e) => setDailyFeedId(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Pilih Sesi Pakan</option>
                  {dailyFeeds.length === 0 ? (
                    <option value="" disabled>
                      Tidak ada sesi pakan tersedia
                    </option>
                  ) : (
                    dailyFeeds.map((feed) => (
                      <option key={feed.id} value={feed.id}>
                        {`${feed.cow_name || `Sapi #${feed.cow_id}`} - ${feed.date} (${feed.session})`}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Pakan</Form.Label>
                <Row>
                  <Col md={6}>
                    <Form.Select
                      value={newFeedId}
                      onChange={(e) => setNewFeedId(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Pilih Pakan</option>
                      {availableFeeds.length === 0 ? (
                        <option value="" disabled>
                          Tidak ada pakan tersedia
                        </option>
                      ) : (
                        availableFeeds.map((feed) => (
                          <option key={feed.id} value={feed.id}>
                            {feed.name} (Stok: {formatNumber(feed.stock)} {feed.unit})
                          </option>
                        ))
                      )}
                    </Form.Select>
                    {newFeedId && (
                      <Form.Text className="text-primary">
                        Stok tersedia:{" "}
                        {formatNumber(
                          feeds.find((f) => f.id === parseInt(newFeedId))?.stock
                        )}{" "}
                        {feeds.find((f) => f.id === parseInt(newFeedId))?.unit || "kg"}
                      </Form.Text>
                    )}
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder={`Jumlah (${
                        feeds.find((f) => f.id === parseInt(newFeedId))?.unit || "kg"
                      })`}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      disabled={loading}
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="success"
                      onClick={handleAddFeed}
                      disabled={loading || !newFeedId || !newQuantity}
                    >
                      <i className="fas fa-plus" />
                    </Button>
                  </Col>
                </Row>
              </Form.Group>

              {selectedFeeds.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Pakan yang Dipilih</Form.Label>
                  <ListGroup>
                    {selectedFeeds.map((item) => {
                      const feed = feeds.find((f) => f.id === item.feedId);
                      return (
                        <ListGroup.Item
                          key={item.feedId}
                          className="d-flex align-items-center mb-2"
                        >
                          <div className="flex-grow-1">
                            <strong>{feed?.name || "Pakan tidak ditemukan"}</strong>
                            <Form.Control
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={formatNumber(item.quantity)}
                              onChange={(e) => handleQuantityChange(item.feedId, e.target.value)}
                              style={{ width: "150px", display: "inline-block", marginLeft: "10px" }}
                              disabled={loading}
                            />
                            {feed && (
                              <Form.Text className="text-muted ms-2">
                                Stok tersedia: {formatNumber(feed.stock)} {feed.unit}
                              </Form.Text>
                            )}
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveFeed(item.feedId)}
                            disabled={loading}
                          >
                            <i className="fas fa-trash" />
                          </Button>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Form.Group>
              )}

              <Button
                variant="primary"
                type="submit"
                className="mt-3"
                disabled={loading}
              >
                <i className="fas fa-save me-2" /> {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CreateDailyFeedItem;