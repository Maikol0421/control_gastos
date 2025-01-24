import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";

const AddMsiModal = ({ open, onClose, paymentTypes, onSave, initialData }) => {
  const [formData, setFormData] = useState(initialData);

  const [errors, setErrors] = useState({});

  const months = [
    { label: "Enero", value: 1 },
    { label: "Febrero", value: 2 },
    { label: "Marzo", value: 3 },
    { label: "Abril", value: 4 },
    { label: "Mayo", value: 5 },
    { label: "Junio", value: 6 },
    { label: "Julio", value: 7 },
    { label: "Agosto", value: 8 },
    { label: "Septiembre", value: 9 },
    { label: "Octubre", value: 10 },
    { label: "Noviembre", value: 11 },
    { label: "Diciembre", value: 12 },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.monto_compra)
      newErrors.monto_compra = "El monto es obligatorio.";
    if (!formData.cantidad_meses)
      newErrors.cantidad_meses = "La cantidad de meses es obligatoria.";
    if (!formData.tipo_pago)
      newErrors.tipo_pago = "El tipo de pago es obligatorio.";
    if (!formData.descripcion)
      newErrors.descripcion = "La descripción es obligatoria.";
    if (!formData.inicio_pagos)
      newErrors.inicio_pagos = "El inicio de pagos es obligatorio.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/ctrl_gastos/create_msi`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (response.ok) {
          onSave(); // Actualiza la tabla principal
          onClose(); // Cierra el modal
        } else {
          console.error("Error al guardar el MSI");
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
      }
    }
  };
  useEffect(() => {
    setFormData(initialData); // Restablecer los datos cuando el modal se abre
  }, [initialData]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar MSI</DialogTitle>
      <DialogContent>
        <TextField
          label="Monto de Compra"
          type="number"
          fullWidth
          margin="normal"
          value={formData.monto_compra}
          onChange={(e) =>
            setFormData({ ...formData, monto_compra: e.target.value })
          }
          error={!!errors.monto_compra}
          helperText={errors.monto_compra}
        />
        <TextField
          label="Cantidad de Meses"
          type="number"
          fullWidth
          margin="normal"
          value={formData.cantidad_meses}
          onChange={(e) =>
            setFormData({ ...formData, cantidad_meses: e.target.value })
          }
          error={!!errors.cantidad_meses}
          helperText={errors.cantidad_meses}
        />
        <Autocomplete
          options={paymentTypes}
          getOptionLabel={(option) => option.descripcion}
          renderInput={(params) => (
            <TextField {...params} label="Tipo de Pago" />
          )}
          value={
            paymentTypes.find((type) => type.clave === formData.tipo_pago) ||
            null
          }
          onChange={(event, newValue) =>
            setFormData({
              ...formData,
              tipo_pago: newValue ? newValue.clave : "",
            })
          }
          error={!!errors.tipo_pago}
          helperText={errors.tipo_pago}
        />
        <TextField
          label="Descripción"
          fullWidth
          margin="normal"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          error={!!errors.descripcion}
          helperText={errors.descripcion}
        />
        <Autocomplete
          options={months}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField {...params} label="Inicio de Pagos" />
          )}
          value={
            months.find((month) => month.value === formData.inicio_pagos) ||
            null
          }
          onChange={(event, newValue) =>
            setFormData({
              ...formData,
              inicio_pagos: newValue ? newValue.value : "",
            })
          }
          error={!!errors.inicio_pagos}
          helperText={errors.inicio_pagos}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMsiModal;
