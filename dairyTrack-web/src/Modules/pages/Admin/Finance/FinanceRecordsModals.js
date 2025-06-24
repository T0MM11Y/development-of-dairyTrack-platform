import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Card,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { format } from "date-fns";

const FinanceRecordsModals = ({
  showAddIncomeModal,
  setShowAddIncomeModal,
  showEditIncomeModal,
  setShowEditIncomeModal,
  showViewIncomeModal,
  setShowViewIncomeModal,
  showAddExpenseModal,
  setShowAddExpenseModal,
  showEditExpenseModal,
  setShowEditExpenseModal,
  showViewExpenseModal,
  setShowViewExpenseModal,
  showIncomeTypeModal,
  setShowIncomeTypeModal,
  showExpenseTypeModal,
  setShowExpenseTypeModal,
  newIncome,
  setNewIncome,
  newExpense,
  setNewExpense,
  selectedRecord,
  setSelectedRecord,
  incomeTypes,
  expenseTypes,
  currentUser,
  handleAddIncome,
  handleEditIncome,
  handleAddExpense,
  handleEditExpense,
  handleIncomeTypeSave,
  handleIncomeTypeDelete,
  handleExpenseTypeSave,
  handleExpenseTypeDelete,
  formatRupiah,
}) => {
  const [formattedIncomeAmount, setFormattedIncomeAmount] = useState("");
  const [formattedExpenseAmount, setFormattedExpenseAmount] = useState("");
  const [newIncomeType, setNewIncomeType] = useState({
    name: "",
    description: "",
    created_by: currentUser?.user_id,
  });
  const [newExpenseType, setNewExpenseType] = useState({
    name: "",
    description: "",
    created_by: currentUser?.user_id,
  });
  const [selectedIncomeType, setSelectedIncomeType] = useState(null);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormattedIncomeAmount(
      newIncome.amount ? formatRupiah(newIncome.amount) : ""
    );
    setFormattedExpenseAmount(
      newExpense.amount ? formatRupiah(newExpense.amount) : ""
    );
  }, [newIncome.amount, newExpense.amount, formatRupiah]);

  const handleIncomeInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncome((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncomeTypeInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncomeType((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseTypeInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpenseType((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseAddIncomeModal = () => {
    setNewIncome({
      amount: "",
      income_type: "",
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      description: "",
      created_by: currentUser?.user_id,
    });
    setShowAddIncomeModal(false);
  };

  const handleCloseAddExpenseModal = () => {
    setNewExpense({
      amount: "",
      expense_type: "",
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      description: "",
      created_by: currentUser?.user_id,
    });
    setShowAddExpenseModal(false);
  };

  const handleCloseEditIncomeModal = () => {
    setSelectedRecord(null);
    setShowEditIncomeModal(false);
  };

  const handleCloseEditExpenseModal = () => {
    setSelectedRecord(null);
    setShowEditExpenseModal(false);
  };

  const handleCloseIncomeTypeModal = () => {
    setNewIncomeType({
      name: "",
      description: "",
      created_by: currentUser?.user_id,
    });
    setSelectedIncomeType(null);
    setShowIncomeTypeModal(false);
  };

  const handleCloseExpenseTypeModal = () => {
    setNewExpenseType({
      name: "",
      description: "",
      created_by: currentUser?.user_id,
    });
    setSelectedExpenseType(null);
    setShowExpenseTypeModal(false);
  };

  const handleAddIncomeWithLoading = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleAddIncome(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditIncomeWithLoading = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleEditIncome(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpenseWithLoading = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleAddExpense(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExpenseWithLoading = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleEditExpense(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIncomeType = async (e) => {
    e.preventDefault();
    const success = await handleIncomeTypeSave(
      {
        ...newIncomeType,
        created_by: parseInt(currentUser.user_id),
        updated_by: parseInt(currentUser.user_id),
      },
      false
    );
    if (success) {
      setNewIncomeType({
        name: "",
        description: "",
        created_by: currentUser?.user_id,
      });
    }
  };

  const handleEditIncomeType = async (e) => {
    e.preventDefault();
    const success = await handleIncomeTypeSave(
      {
        ...selectedIncomeType,
        created_by: parseInt(
          selectedIncomeType.created_by?.id || currentUser.user_id
        ),
        updated_by: parseInt(currentUser.user_id),
      },
      true,
      selectedIncomeType.id
    );
    if (success) {
      setSelectedIncomeType(null);
    }
  };

  const handleAddExpenseType = async (e) => {
    e.preventDefault();
    const success = await handleExpenseTypeSave(
      {
        ...newExpenseType,
        created_by: parseInt(currentUser.user_id),
        updated_by: parseInt(currentUser.user_id),
      },
      false
    );
    if (success) {
      setNewExpenseType({
        name: "",
        description: "",
        created_by: currentUser?.user_id,
      });
    }
  };

  const handleEditExpenseType = async (e) => {
    e.preventDefault();
    const success = await handleExpenseTypeSave(
      {
        ...selectedExpenseType,
        created_by: parseInt(
          selectedExpenseType.created_by?.id || currentUser.user_id
        ),
        updated_by: parseInt(currentUser.user_id),
      },
      true,
      selectedExpenseType.id
    );
    if (success) {
      setSelectedExpenseType(null);
    }
  };

  return (
    <>
      <Modal
        show={showAddIncomeModal}
        onHide={handleCloseAddIncomeModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-plus me-2" /> Add Income
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddIncomeWithLoading}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={newIncome.amount}
                      onChange={handleIncomeInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                    />
                  </InputGroup>
                  {formattedIncomeAmount && (
                    <Form.Text className="text-muted">
                      {formattedIncomeAmount}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Income Type</Form.Label>
                  <Form.Select
                    name="income_type"
                    value={newIncome.income_type}
                    onChange={handleIncomeInputChange}
                    required
                  >
                    <option value="">Select income type</option>
                    {incomeTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="transaction_date"
                    value={newIncome.transaction_date}
                    onChange={handleIncomeInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newIncome.description}
                    onChange={handleIncomeInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddIncomeModal}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showEditIncomeModal}
        onHide={handleCloseEditIncomeModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2" /> Edit Income
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditIncomeWithLoading}>
          <Modal.Body>
            {selectedRecord && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>Rp</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={selectedRecord.amount}
                        onChange={handleEditInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      {formatRupiah(selectedRecord.amount)}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Income Type</Form.Label>
                    <Form.Select
                      name="income_type"
                      value={selectedRecord.income_type}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Select income type</option>
                      {incomeTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Transaction Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="transaction_date"
                      value={format(
                        new Date(selectedRecord.transaction_date),
                        "yyyy-MM-dd'T'HH:mm"
                      )}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={selectedRecord.description}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditIncomeModal}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showViewIncomeModal}
        onHide={() => setShowViewIncomeModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-eye me-2" /> Income Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5>{selectedRecord.description || "N/A"}</h5>
                <p>
                  <strong>Amount:</strong> {formatRupiah(selectedRecord.amount)}
                </p>
                <p>
                  <strong>Category:</strong> {selectedRecord.category}
                </p>
                <p>
                  <strong>Transaction Date:</strong>{" "}
                  {new Date(selectedRecord.transaction_date).toLocaleString(
                    "id-ID"
                  )}
                </p>
                <p>
                  <strong>Created By:</strong>{" "}
                  {selectedRecord.created_by?.username || "N/A"}
                </p>
                <p>
                  <strong>Updated By:</strong>{" "}
                  {selectedRecord.updated_by?.username || "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedRecord.created_at).toLocaleString("id-ID")}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(selectedRecord.updated_at).toLocaleString("id-ID")}
                </p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewIncomeModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAddExpenseModal}
        onHide={handleCloseAddExpenseModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-plus me-2" /> Add Expense
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddExpenseWithLoading}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={newExpense.amount}
                      onChange={handleExpenseInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                    />
                  </InputGroup>
                  {formattedExpenseAmount && (
                    <Form.Text className="text-muted">
                      {formattedExpenseAmount}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Expense Type</Form.Label>
                  <Form.Select
                    name="expense_type"
                    value={newExpense.expense_type}
                    onChange={handleExpenseInputChange}
                    required
                  >
                    <option value="">Select expense type</option>
                    {expenseTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="transaction_date"
                    value={newExpense.transaction_date}
                    onChange={handleExpenseInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newExpense.description}
                    onChange={handleExpenseInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddExpenseModal}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showEditExpenseModal}
        onHide={handleCloseEditExpenseModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2" /> Edit Expense
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditExpenseWithLoading}>
          <Modal.Body>
            {selectedRecord && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>Rp</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={selectedRecord.amount}
                        onChange={handleEditInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      {formatRupiah(selectedRecord.amount)}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Expense Type</Form.Label>
                    <Form.Select
                      name="expense_type"
                      value={selectedRecord.expense_type}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Select expense type</option>
                      {expenseTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Transaction Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="transaction_date"
                      value={format(
                        new Date(selectedRecord.transaction_date),
                        "yyyy-MM-dd'T'HH:mm"
                      )}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={selectedRecord.description}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditExpenseModal}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showViewExpenseModal}
        onHide={() => setShowViewExpenseModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-eye me-2" /> Expense Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5>{selectedRecord.description || "N/A"}</h5>
                <p>
                  <strong>Amount:</strong> {formatRupiah(selectedRecord.amount)}
                </p>
                <p>
                  <strong>Category:</strong> {selectedRecord.category}
                </p>
                <p>
                  <strong>Transaction Date:</strong>{" "}
                  {new Date(selectedRecord.transaction_date).toLocaleString(
                    "id-ID"
                  )}
                </p>
                <p>
                  <strong>Created By:</strong>{" "}
                  {selectedRecord.created_by?.username || "N/A"}
                </p>
                <p>
                  <strong>Updated By:</strong>{" "}
                  {selectedRecord.updated_by?.username || "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedRecord.created_at).toLocaleString("id-ID")}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(selectedRecord.updated_at).toLocaleString("id-ID")}
                </p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewExpenseModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showIncomeTypeModal}
        onHide={handleCloseIncomeTypeModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-list me-2" /> Manage Income Types
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={
              selectedIncomeType ? handleEditIncomeType : handleAddIncomeType
            }
          >
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={
                      selectedIncomeType
                        ? selectedIncomeType.name
                        : newIncomeType.name
                    }
                    onChange={(e) =>
                      selectedIncomeType
                        ? setSelectedIncomeType((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        : handleIncomeTypeInputChange(e)
                    }
                    required
                    placeholder="Enter income type name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={
                      selectedIncomeType
                        ? selectedIncomeType.description
                        : newIncomeType.description
                    }
                    onChange={(e) =>
                      selectedIncomeType
                        ? setSelectedIncomeType((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        : handleIncomeTypeInputChange(e)
                    }
                    placeholder="Enter description"
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  style={{ letterSpacing: "0.5px" }}
                >
                  {selectedIncomeType ? "Update" : "Add"}
                </Button>
              </Col>
            </Row>
          </Form>
          <div className="table-responsive mt-3">
            <table
              className="table table-hover border rounded shadow-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <thead className="bg-gradient-light">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Description</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomeTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td>{type.description || "N/A"}</td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => setSelectedIncomeType(type)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: "Are you sure?",
                            text: `You are about to delete income type "${type.name}".`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, delete it!",
                          });
                          if (result.isConfirmed) {
                            await handleIncomeTypeDelete(type.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseIncomeTypeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showExpenseTypeModal}
        onHide={handleCloseExpenseTypeModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-list me-2" /> Manage Expense Types
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={
              selectedExpenseType ? handleEditExpenseType : handleAddExpenseType
            }
          >
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={
                      selectedExpenseType
                        ? selectedExpenseType.name
                        : newExpenseType.name
                    }
                    onChange={(e) =>
                      selectedExpenseType
                        ? setSelectedExpenseType((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        : handleExpenseTypeInputChange(e)
                    }
                    required
                    placeholder="Enter expense type name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={
                      selectedExpenseType
                        ? selectedExpenseType.description
                        : newExpenseType.description
                    }
                    onChange={(e) =>
                      selectedExpenseType
                        ? setSelectedExpenseType((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        : handleExpenseTypeInputChange(e)
                    }
                    placeholder="Enter description"
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  style={{ letterSpacing: "0.5px" }}
                >
                  {selectedExpenseType ? "Update" : "Add"}
                </Button>
              </Col>
            </Row>
          </Form>
          <div className="table-responsive mt-3">
            <table
              className="table table-hover border rounded shadow-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <thead className="bg-gradient-light">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Description</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenseTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td>{type.description || "N/A"}</td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => setSelectedExpenseType(type)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: "Are you sure?",
                            text: `You are about to delete expense type "${type.name}".`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, delete it!",
                          });
                          if (result.isConfirmed) {
                            await handleExpenseTypeDelete(type.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseExpenseTypeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FinanceRecordsModals;
