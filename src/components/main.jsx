import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExpenseForm = () => {
  const [filters, setFilters] = useState({
    anio: "2025",
    tipo_pago: "",
    mes: "",
  });
  const [formData, setFormData] = useState({
    cantidad: "",
    tipo_pago: "",
    fecha: "",
    descripcion: "",
  });
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (customFilters = {}) => {
    try {
      const response = await fetch("http://localhost:3000/api/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...filters, ...customFilters }),
      });
      const result = await response.json();
      console.log(result)
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Manejo de filtros
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = () => {
    // Aquí podrías filtrar datos localmente o hacer una consulta a la API
    console.log("Filtros aplicados:", filters);
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const columns = ["Cantidad", "Tipo de Pago", "Fecha", "Descripción"];
    const rows = data.map((row) => [row.cantidad, row.tipo_pago, row.fecha, row.descripcion]);

    autoTable(doc, {
      head: [columns],
      body: rows,
    });
    doc.save("ConsultaGastos.pdf");
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const rowDataToExport = data.map(({ cantidad, tipo_pago, fecha, descripcion }) => ({
      Cantidad: cantidad,
      "Tipo de Pago": tipo_pago,
      Fecha: fecha,
      Descripción: descripcion,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rowDataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "ConsultaGastos.xlsx");
  };

  // Crear nuevo registro
  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateSubmit = () => {
    setData((prev) => [...prev, formData]);
    setFormData({ cantidad: "", tipo_pago: "", fecha: "", descripcion: "" });
    handleCloseModal();
  };

  return (
    <div>
      <h1>Consulta de Gastos</h1>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Autocomplete
          options={["2025", "2026", "2027"]}
          renderInput={(params) => <TextField {...params} label="Año" />}
          value={filters.anio}
          onChange={(_, value) => handleFilterChange("anio", value)}
        />
        <Autocomplete
          options={["Enero", "Febrero", "Marzo"]}
          renderInput={(params) => <TextField {...params} label="Mes" />}
          value={filters.mes}
          onChange={(_, value) => handleFilterChange("mes", value)}
        />
        <Autocomplete
          options={["Efectivo", "Tarjeta", "Transferencia"]}
          renderInput={(params) => <TextField {...params} label="Tipo de Pago" />}
          value={filters.tipo_pago}
          onChange={(_, value) => handleFilterChange("tipo_pago", value)}
        />
        <Button variant="contained" onClick={handleFilterSubmit}>
          Consultar
        </Button>
      </div>

      {/* Botones de exportación */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button variant="contained" onClick={exportToPDF}>
          Exportar a PDF
        </Button>
        <Button variant="contained" onClick={exportToExcel}>
          Exportar a Excel
        </Button>
      </div>

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cantidad</TableCell>
              <TableCell>Tipo de Pago</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Descripción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.cantidad}</TableCell>
                <TableCell>{row.tipo_pago}</TableCell>
                <TableCell>{row.fecha}</TableCell>
                <TableCell>{row.descripcion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Botón para abrir modal */}
      <Button variant="contained" style={{ marginTop: "20px" }} onClick={handleOpenModal}>
        Crear Nuevo Registro
      </Button>

      {/* Modal para crear nuevo registro */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Crear Nuevo Registro</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Cantidad"
            value={formData.cantidad}
            onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
          />
          <Autocomplete
            options={["Efectivo", "Tarjeta", "Transferencia"]}
            renderInput={(params) => <TextField {...params} label="Tipo de Pago" />}
            value={formData.tipo_pago}
            onChange={(_, value) => setFormData({ ...formData, tipo_pago: value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Fecha"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleCreateSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExpenseForm;
