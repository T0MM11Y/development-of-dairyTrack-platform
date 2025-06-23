import React from "react";
import { Modal, Button, Row, Col, Badge } from "react-bootstrap";

const ViewDiseaseHistory = ({ show, onClose, history, check, symptom, cow }) => {
  if (!history) return null;

  const renderSymptoms = () => {
if (!symptom) return <p className="text-muted fst-italic">No symptoms recorded.</p>;

    return Object.entries(symptom)
      .filter(([key]) => !["id", "health_check", "created_at", "created_by", "edited_by"].includes(key))
      .map(([key, val]) => (
        <div key={key} className="mb-2">
          <Badge bg="secondary" className="me-2">
            {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
          <span className="text-dark">{val || "-"}</span>
        </div>
      ));
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <i className="bi bi-journal-medical text-primary fs-4"></i>
<span className="fw-semibold">Disease History Details</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Info Sapi */}
        <div className="mb-3">
          <h5 className="text-primary">
            <i className="bi bi-cow me-2"></i>
            {cow ? `${cow.name} (${cow.breed})` : "Sapi tidak ditemukan"}
          </h5>
        </div>

        <hr />

        {/* Pemeriksaan */}
        <div className="mb-4">
          <h6 className="text-secondary mb-2">
            <i className="bi bi-heart-pulse-fill me-2 text-danger"></i>
    Health Check Details
          </h6>
          {check ? (
            <Row>
              <Col md={6}><strong>Rectal Temperature:</strong> {check.rectal_temperature}°C</Col>
              <Col md={6}><strong>Heart Rate:</strong> {check.heart_rate}</Col>
              <Col md={6}><strong>Respiration Rate:</strong> {check.respiration_rate}</Col>
              <Col md={6}><strong>Rumination:</strong> {check.rumination}</Col>
              <Col md={12} className="mt-2">
                <strong>Checkup Date:</strong>{" "}
                {new Date(check.checkup_date).toLocaleString("id-ID")}
              </Col>
            </Row>
          ) : (
            <p className="text-muted fst-italic">Health check data not available.</p>
          )}
        </div>

        <hr />

        {/* Gejala */}
        <div className="mb-4">
          <h6 className="text-secondary mb-2">
            <i className="bi bi-virus2 me-2 text-warning"></i>
            Symptom
          </h6>
          {renderSymptoms()}
        </div>

        <hr />

        {/* Deskripsi */}
        <div>
          <h6 className="text-secondary mb-2">
            <i className="bi bi-clipboard2-pulse me-2 text-info"></i>
    History Description
          </h6>
          <p>
            {history.description || (
              <span className="text-muted fst-italic">No description available.</span>
            )}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          <i className="bi bi-x-circle me-1"></i>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewDiseaseHistory;
