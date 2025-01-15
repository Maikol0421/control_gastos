import React, { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { es } from "date-fns/locale";
import axios from "axios";
import "../assets/styles.css";

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    paymentType: "",
    date: null,
    description: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const paymentTypes = ["Efectivo", "Tarjeta", "Transferencia"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentTypeChange = (_, value) => {
    setFormData((prev) => ({ ...prev, paymentType: value || "" }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({ ...prev, date: newDate }));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await axios.post("https://api.example.com/expenses", formData);
      setSnackbarOpen(true);
      handleCloseModal();
      setFormData({ amount: "", paymentType: "", date: null, description: "" });
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <div className="container">
        <h2>Control de Gastos</h2>
        <TextField
          fullWidth
          margin="normal"
          label="Cantidad"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          sx={{ mb: "2rem" }}
        />
        <Autocomplete
          fullWidth
          options={paymentTypes}
          renderInput={(params) => (
            <TextField {...params} label="Tipo de Pago" />
          )}
          sx={{ mb: "2rem" }}
          value={formData.paymentType}
          onChange={handlePaymentTypeChange}
        />
        <DatePicker
          sx={{ mb: "2rem" }}
          label="Fecha"
          value={formData.date}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" />
          )}
          inputFormat="dd/MM/yyyy"
        />
        <TextField
          sx={{ mb: "2rem" }}
          fullWidth
          margin="normal"
          label="Descripción"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        <Button
          sx={{ mb: "2rem" }}
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleOpenModal}
        >
          Enviar
        </Button>

        <Dialog open={isModalOpen} onClose={handleCloseModal}>
          <DialogTitle>Confirmar Envío</DialogTitle>
          <DialogContent>
            <p>
              <strong>Cantidad:</strong> {formData.amount}
            </p>
            <p>
              <strong>Tipo de Pago:</strong> {formData.paymentType}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {formData.date
                ? new Date(formData.date).toLocaleDateString("es-ES")
                : ""}
            </p>
            <p>
              <strong>Descripción:</strong> {formData.description}
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message="Datos enviados con éxito"
        />
      </div>
    </LocalizationProvider>
  );
};

export default ExpenseForm;
