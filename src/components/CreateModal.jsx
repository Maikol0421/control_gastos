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
import Swal from "sweetalert2";
const CreateModal = ({ open, onClose, paymentTypes, onSave, initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData); // Restablecer los datos cuando el modal se abre
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.cantidad) newErrors.cantidad = "La cantidad es obligatoria.";
    if (!formData.tipo_pago)
      newErrors.tipo_pago = "El tipo de pago es obligatorio.";
    if (!formData.descripcion)
      newErrors.descripcion = "La descripción es obligatoria.";
    if (!formData.fecha) newErrors.fecha = "La fecha es obligatoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/ctrl_gastos/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (response.ok) {
          Swal.fire({
            position: "top-center",
            icon: "success",
            title: "Creado exitosamente.",
            showConfirmButton: false,
            timer: 1200,
          });
          onSave(); // Actualiza la tabla principal
          onClose(); // Cierra el modal
        } else {
          console.error("Error al guardar el registro");
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
      }
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Registro</DialogTitle>
      <DialogContent>
        <TextField
          label="Cantidad"
          type="number"
          fullWidth
          margin="normal"
          value={formData.cantidad}
          onChange={(e) =>
            setFormData({ ...formData, cantidad: e.target.value })
          }
          error={!!errors.cantidad}
          helperText={errors.cantidad}
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
        <TextField
          label="Fecha"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          margin="normal"
          value={formData.fecha}
          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          error={!!errors.fecha}
          helperText={errors.fecha}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateModal;
