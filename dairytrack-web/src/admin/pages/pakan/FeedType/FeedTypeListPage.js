import { useEffect, useState } from "react";
import { getFeedTypes, deleteFeedType } from "../../../../api/pakan/feedType";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CreateFeedTypeModal from "./CreateFeedType";
import FeedTypeDetailEditModal from "./FeedTypeDetail";

const FeedTypeListPage = () => {
  const [feedTypes, setFeedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFeedTypes();
      if (response.success && response.feedTypes) {
        setFeedTypes(response.feedTypes);
      } else {
        console.error("Unexpected response format", response);
        setFeedTypes([]);
      }
    } catch (error) {
      console.error("Failed to fetch feed types:", error.message);
      setFeedTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this feed type?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteFeedType(id);
        console.log("Delete Response:", response);

        Swal.fire("Deleted!", "Feed type has been deleted.", "success");
        setFeedTypes(feedTypes.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Failed to delete feed type:", error.message);
        Swal.fire("Error!", "An error occurred while deleting.", "error");
      }
    }
  };

  const handleAddFeedType = (newFeedType) => {
    setFeedTypes((prev) => [...prev, newFeedType]);
    setShowCreateModal(false);
  };

  const handleUpdateFeedType = (updatedFeedType) => {
    setFeedTypes((prev) =>
      prev.map((item) =>
        item.id === updatedFeedType.id ? { ...item, ...updatedFeedType } : item
      )
    );
    setShowDetailModal(false);
  };

  const handleViewFeedType = (id) => {
    setSelectedFeedId(id);
    setShowDetailModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl fw-bold text-dark">Feed Types Data</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-info waves-effect waves-light"
          style={{
            borderRadius: "8px",
            padding: "8px 20px",
            fontSize: "1rem",
          }}
        >
          + Add Feed Type
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading feed types data...</p>
        </div>
      ) : feedTypes.length === 0 ? (
        <p className="text-muted">No feed types data available.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedTypes.map((feed, index) => (
                    <tr key={feed.id}>
                      <td>{index + 1}</td>
                      <td>{feed.name}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleViewFeedType(feed.id)}
                          aria-label={`Edit ${feed.name}`}
                          style={{ borderRadius: "6px" }}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(feed.id)}
                          aria-label={`Delete ${feed.name}`}
                          style={{ borderRadius: "6px" }}
                        >
                          <i className="ri-delete-bin-6-line"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateFeedTypeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleAddFeedType}
        />
      )}

      {showDetailModal && (
        <FeedTypeDetailEditModal
          feedId={selectedFeedId}
          onClose={() => setShowDetailModal(false)}
          onSuccess={handleUpdateFeedType}
        />
      )}
    </div>
  );
};

export default FeedTypeListPage;
