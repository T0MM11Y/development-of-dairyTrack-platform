import React, { useEffect, useState } from "react";
import { getAllFeedItems, deleteFeedItem } from "../../../../controllers/feedItemController";
import { getAllDailyFeeds } from "../../../../controllers/feedScheduleController";
import CowsWithoutFeedItems from "../DailyFeedItem/CowWithoutFeedItem";
import Swal from "sweetalert2";
import { Button, Card, Table, Spinner, Form, Tabs, Tab, InputGroup, FormControl } from "react-bootstrap";

const DailyFeedItemsListPage = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [dailyFeeds, setDailyFeeding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
  );
  const [endDate, setEndDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
  );

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSupervisor = user?.role?.toLowerCase() === "supervisor";
  const isFarmer = user?.role?.name.toLowerCase() === "farmer";

  const disableIfSupervisor = isSupervisor
    ? { disabled: true, title: "Supervisors cannot edit data.", style: { opacity: 0.5, cursor: "not-allowed" } }
    : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedItemsResponse, dailyFeedsResponse] = await Promise.all([
        getAllFeedItems(),
        getAllDailyFeeds({ startDate, endDate }),
      ]);

      if (feedItemsResponse.success && Array.isArray(feedItemsResponse.data)) {
        setFeedItems(feedItemsResponse.data);
      } else {
        setFeedItems([]);
      }

      if (dailyFeedsResponse.success && Array.isArray(dailyFeedsResponse.data)) {
        let arrayFeed = [];
        dailyFeedsResponse.data.forEach((item, index) => {
          arrayFeed.push({
            id: item.id,
            cow_id: item.cowId,
            cow_name: item.cow.cowName,
            date: item.date,
            session: item.session,
            weather: item.weather || "No data"
          });
        });
        setDailyFeeding(arrayFeed);
      } else {
        setDailyFeeding([]);
        Swal.fire("Error", dailyFeedsResponse.message || "Failed to load feed schedules.", "error");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeedItems([]);
      setDailyFeeding([]);
      Swal.fire("Error", "Failed to load data: " + error.message, "error");
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
  }, [startDate, endDate]);

  const groupedFeedItems = dailyFeeds.reduce((acc, dailyFeed) => {
    const key = `${dailyFeed.cow_id}_${dailyFeed.date}_${dailyFeed.session}`;
    const items = feedItems.filter((item) => item.daily_feed_id === dailyFeed.id);
    acc[key] = {
      cow_id: dailyFeed.cow_id,
      cow_name: dailyFeed.cow_name,
      date: dailyFeed.date,
      session: dailyFeed.session,
      weather: dailyFeed.weather,
      items,
      daily_feed_id: dailyFeed.id,
    };
    return acc;
  }, {});

  const filteredFeedItems = Object.values(groupedFeedItems).filter((group) =>
    group.cow_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.session.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.items.some((item) =>
      (item.Feed?.name || item.feed_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID");
    } catch (error) {
      return dateString;
    }
  };

  const handleDeleteClick = async (group) => {
    const result = await Swal.fire({
      title: "Confirm",
      text: `Delete feed items for cow ${group.cow_name} on ${formatDate(group.date)} session ${group.session}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const items = group.items;
        if (items && items.length > 0) {
          await Promise.all(items.map((item) => deleteFeedItem(item.id)));
          Swal.fire({
            title: "Success!",
            text: "Feed items deleted successfully.",
            icon: "success",
            timer: 1500,
          });
        } else {
          Swal.fire({
            title: "Note",
            text: "No feed items to delete.",
            icon: "info",
            timer: 1500,
          });
        }
        fetchData();
      } catch (error) {
        console.error("Failed to delete feed items:", error.message);
        Swal.fire("Error!", "Failed to delete: " + error.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container-fluid mt-4">
      <style>
        {`
          .custom-card { border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .custom-card-header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 1.5rem; }
          .custom-card-header h4 { margin: 0; font-weight: 600; font-size: 1.5rem; }
          .custom-table { margin-bottom: 0; background-color: #fff; }
          .custom-table th { background-color: #f8f9fa; font-weight: 600; text-transform: uppercase; font-size: 0.9rem; padding: 1rem; color: #495057; }
          .custom-table td { padding: 1rem; font-size: 0.95rem; color: #333; text-align: center; vertical-align: middle;}
          .custom-table tr:nth-child(even) { background-color: #f9f9f9; }
          .custom-table tr:hover { background-color: #e9ecef; transition: background-color 0.2s; }
          .custom-tabs .nav-link { font-weight: 500; color: #495057; padding: 0.75rem 1.5rem; border-radius: 8px 8px 0 0; }
          .custom-tabs .nav-link.active { background-color: #007bff; color: white; font-weight: 600; }
          .custom-button { border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.9rem; transition: all 0.2s; }
          .custom-button:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }
          .search-input { border-radius: 8px; border: 1px solid #ced4da; font-size: 0.95rem; }
          .loading-container { display: flex; flex-direction: column; align-items: center; padding: 3rem 0; }
          .loading-text { margin-top: 1rem; color: #6c757d; font-size: 1rem; }
        `}
      </style>

      <Card className="custom-card">
        <Card.Header className="custom-card-header">
          <h4><i className="fas fa-utensils me-2" /> Daily Feed Items</h4>
        </Card.Header>
        <Card.Body className="p-4">
          <Tabs defaultActiveKey="feed-items" id="feed-items-tabs" className="custom-tabs mb-4">
            <Tab eventKey="feed-items" title="Feed Items">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <InputGroup style={{ maxWidth: "300px" }}>
                  <FormControl
                    className="search-input"
                    placeholder="Search cow or feed name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <div className="d-flex gap-2">
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      max={new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })}
                      min={startDate}
                    />
                  </Form.Group>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <Spinner animation="border" variant="primary" />
                  <p className="loading-text">Loading feed items...</p>
                </div>
              ) : filteredFeedItems.length === 0 ? (
                <p className="text-center text-muted py-4">
                  {searchTerm ? "No data matches your search." : "No feed items for this date."}
                </p>
              ) : (
                <div className="table-responsive">
                  <Table bordered hover className="custom-table">
                    <thead>
                      <tr>
                        <th>Cow Name</th>
                        <th>Date</th>
                        <th>Session</th>
                        <th>Feed</th>
                        <th>Weather</th>
                        {isFarmer && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedItems.map((group) => (
                        <tr key={`${group.cow_id}_${group.date}_${group.session}`}>
                          <td>{group.cow_name}</td>
                          <td>{formatDate(group.date)}</td>
                          <td>{group.session}</td>
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
                                    <small className="text-muted">
                                      {feedItem.quantity} kg
                                    </small>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{group.weather}</td>
                          {isFarmer && (
                            <td>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="custom-button me-2"
                                onClick={() => {
                                  if (!isSupervisor && group.daily_feed_id) {
                                    // Navigate to CreateDailyFeedItem with daily_feed_id
                                    window.location.href = `/daily-feed-item/create?dailyFeedId=${group.daily_feed_id}`;
                                  }
                                }}
                                disabled={!group.daily_feed_id}
                                {...disableIfSupervisor}
                              >
                                <i className="fas fa-plus" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="custom-button"
                                onClick={() => !isSupervisor && handleDeleteClick(group)}
                                disabled={group.items.length === 0}
                                {...disableIfSupervisor}
                              >
                                <i className="fas fa-trash" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Tab>
            <Tab eventKey="missing" title="Cows Without Feed Items">
              <CowsWithoutFeedItems
                dailyFeeds={dailyFeeds}
                startDate={startDate}
                endDate={endDate}
                onFeedItemAdded={fetchData}
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DailyFeedItemsListPage;