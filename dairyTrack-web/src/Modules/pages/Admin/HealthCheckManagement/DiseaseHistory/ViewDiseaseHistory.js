import React from "react";
import { Modal, Button, Row, Col, Badge } from "react-bootstrap";

const ViewDiseaseHistory = ({ show, onClose, history, check, symptom, cow }) => {
  if (!history) return null;

  const renderSymptoms = () => {
    if (!symptom) return <p className="text-muted">Tidak ada gejala dicatat.</p>;

    return Object.entries(symptom)
      .filter(([key]) => !["id", "health_check", "created_at", "created_by", "edited_by"].includes(key))
      .map(([key, val]) => (
        <div key={key} className="mb-1">
          <Badge bg="light" text="dark" className="me-1">
            {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>{" "}
          <span>{val || "-"}</span>
        </div>
      ));
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          🩺 <span className="fw-semibold">Detail Riwayat Penyakit</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="text-primary mb-3">
          🐄 Sapi: {cow ? `${cow.name} (${cow.breed})` : "Tidak Ditemukan"}
        </h5>

        <hr />
        <div className="mb-3">
          <h6 className="text-secondary">📋 Detail Pemeriksaan</h6>
          {check ? (
            <Row>
              <Col md={6}><strong>Suhu:</strong> {check.rectal_temperature}°C</Col>
              <Col md={6}><strong>Denyut Jantung:</strong> {check.heart_rate}</Col>
              <Col md={6}><strong>Pernapasan:</strong> {check.respiration_rate}</Col>
              <Col md={6}><strong>Ruminasi:</strong> {check.rumination}</Col>
              <Col md={12}><strong>Tanggal Periksa:</strong> {new Date(check.checkup_date).toLocaleString("id-ID")}</Col>
            </Row>
          ) : (
            <p className="text-muted fst-italic">Data pemeriksaan tidak tersedia.</p>
          )}
        </div>

        <hr />
        <div className="mb-3">
          <h6 className="text-secondary">🦠 Gejala</h6>
          {renderSymptoms()}
        </div>

        <hr />
        <div>
          <h6 className="text-secondary">📝 Deskripsi</h6>
          <p>{history.description || <span className="text-muted fst-italic">Tidak ada deskripsi.</span>}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewDiseaseHistory;
