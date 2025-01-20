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
  FormControlLabel,
  Switch,
  TablePagination,
  Box,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import excelIcon from "../images/xlsx.png";
import pdfIcon from "../images/pdf.png";
import deleteIcon from "../images/delete.png";

const ExpenseForm = () => {
  const [filters, setFilters] = useState({
    anio: "2025",
    mes: "",
    fecha_inicial: "",
    fecha_final: "",
    tipo_pago: "",
    type_date: true,
  });
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const initialCreateData = {
    cantidad: "",
    tipo_pago: "",
    fecha: "",
    descripcion: "",
  };
  const initialErrors = {
    cantidad: "",
    tipo_pago: "",
    fecha: "",
    descripcion: "",
  };
  const [createData, setCreateData] = useState(initialCreateData);
  const [errors, setErrors] = useState(initialErrors);
  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true); // Abrir el modal
  };
  const resetForm = () => {
    setCreateData(initialCreateData); // Restablecer valores del formulario
    setErrors(initialErrors); // Restablecer validaciones
  };
  const validateForm = () => {
    const newErrors = {};
    if (!createData.cantidad)
      newErrors.cantidad = "La cantidad es obligatoria.";
    if (!createData.tipo_pago)
      newErrors.tipo_pago = "El tipo de pago es obligatorio.";
    if (!createData.fecha) newErrors.fecha = "La fecha es obligatoria.";
    if (!createData.descripcion)
      newErrors.descripcion = "La descripción es obligatoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Devuelve true si no hay errores
  };
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false); // Cerrar el modal
  };
  useEffect(() => {
    fetchData();
    fetchPaymentTypes();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchText.toLowerCase();
    const filtered = data.filter(
      (row) =>
        row.cantidad.toString().includes(lowercasedFilter) ||
        row.tipo_pago.toLowerCase().includes(lowercasedFilter) ||
        row.fecha.includes(lowercasedFilter) ||
        row.descripcion.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredData(filtered);
  }, [searchText, data]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ctrl_gastos/filter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        }
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ctrl_gastos/tipo_pago`
      );
      const result = await response.json();
      setPaymentTypes(result);
    } catch (error) {
      console.error("Error fetching payment types:", error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/ctrl_gastos/delete`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            }
          );
          const result = await response.json();
          if (result.status === 200) {
            Swal.fire(
              "Eliminado",
              "Registro eliminado exitosamente",
              "success"
            );
            fetchData();
          }
        } catch (error) {
          console.error("Error deleting data:", error);
        }
      }
    });
  };

  const calculateTotal = () => {
    return data.reduce((sum, row) => sum + row.cantidad, 0).toFixed(2);
  };

  const formatCurrency = (value) => {
    return `$ ${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const columns = ["Fecha", "Cantidad", "Tipo de Pago", "Descripción"];
    const rows = filteredData.map((row) => [
      row.fecha,
      formatCurrency(row.cantidad),
      row.tipo_pago,
      row.descripcion,
    ]);
    rows.push(["Total", formatCurrency(calculateTotal()), "", ""]);

    autoTable(doc, {
      head: [columns],
      body: rows,
    });
    const fileName = `control_gastos_pdf_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = () => {
    const rowDataToExport = filteredData.map((row) => ({
      Fecha: row.fecha,
      Cantidad: formatCurrency(row.cantidad),
      "Tipo de Pago": row.tipo_pago,
      Descripción: row.descripcion,
    }));

    rowDataToExport.push({
      Fecha: "Total",
      Cantidad: formatCurrency(calculateTotal()),
      "Tipo de Pago": "",
      Descripción: "",
    });

    const worksheet = XLSX.utils.json_to_sheet(rowDataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");

    const fileName = `control_gastos_xlsx_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.xlsx`;
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
  };

  const handleCreateSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/ctrl_gastos/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createData),
          }
        );
        const result = await response.json();
        console.log(result);
        if (result?.id) {
          Swal.fire("Creado", "Registro creado exitosamente", "success");
          fetchData();
          resetForm();
          setIsCreateModalOpen(false);
        }
      } catch (error) {
        console.error("Error creating data:", error);
      }
    }
  };

  const handleTypeDateChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      type_date: event.target.checked,
      anio: event.target.checked ? prev.anio : null,
      mes: event.target.checked ? prev.mes : null,
      fecha_inicial: event.target.checked ? null : prev.fecha_inicial,
      fecha_final: event.target.checked ? null : prev.fecha_final,
    }));
  };

  return (
    <div>
      <h1>Consulta de Gastos</h1>
      {/* Botón para abrir el modal de filtros */}
      <Box>
        <Button
          variant="contained"
          style={{ marginBottom: "20px" }}
          onClick={() => setIsFilterModalOpen(true)}
        >
          Filtros
        </Button>
      </Box>

      {/* Modal de Filtros */}
      <Dialog
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={filters.type_date}
                onChange={handleTypeDateChange}
                color="primary"
              />
            }
            label={filters.type_date ? "Mensual" : "Rango de Fechas"}
          />

          {filters.type_date ? (
            <>
              <Autocomplete
                options={["2025", "2026", "2027"]}
                renderInput={(params) => <TextField {...params} label="Año" />}
                value={filters.anio}
                onChange={(_, value) =>
                  setFilters((prev) => ({ ...prev, anio: value }))
                }
                sx={{ marginBottom: "1rem" }}
              />
              <Autocomplete
                options={["Enero", "Febrero", "Marzo"]}
                renderInput={(params) => <TextField {...params} label="Mes" />}
                value={filters.mes}
                onChange={(_, value) =>
                  setFilters((prev) => ({ ...prev, mes: value }))
                }
                sx={{ marginBottom: "1rem" }}
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Fecha Inicial"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.fecha_inicial}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    fecha_inicial: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Fecha Final"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.fecha_final}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    fecha_final: e.target.value,
                  }))
                }
              />
            </>
          )}
          <Autocomplete
            options={paymentTypes} // Opciones obtenidas del backend
            getOptionLabel={(option) => option.descripcion} // Mostrar descripción
            renderInput={(params) => (
              <TextField {...params} label="Tipo de Pago" />
            )}
            value={
              paymentTypes.find(
                (option) => option.clave === filters.tipo_pago
              ) || null
            } // Buscar clave en filters
            onChange={(event, newValue) =>
              setFilters({
                ...filters,
                tipo_pago: newValue ? newValue.clave : "",
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setFilters({
                anio: "",
                mes: "",
                fecha_inicial: "",
                fecha_final: "",
                tipo_pago: "",
                type_date: true,
              })
            }
          >
            Borrar Filtros
          </Button>
          <Button onClick={() => setIsFilterModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              fetchData();
              setIsFilterModalOpen(false);
            }}
          >
            Consultar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Botón para abrir el modal de creación */}
      <Button
        variant="contained"
        style={{ marginBottom: "20px" }}
        onClick={handleOpenCreateModal}
      >
        Agregar Registro
      </Button>

      {/* Modal de Creación */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Registro</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            margin="normal"
            inputProps={{ step: "0.01" }}
            value={createData.cantidad}
            onChange={(e) =>
              setCreateData({ ...createData, cantidad: e.target.value })
            }
            error={!!errors.cantidad}
            helperText={errors.cantidad}
          />
          <Autocomplete
            options={paymentTypes}
            getOptionLabel={(option) => option.descripcion}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tipo de Pago"
                error={!!errors.tipo_pago}
                helperText={errors.tipo_pago}
              />
            )}
            value={
              paymentTypes.find(
                (option) => option.clave === createData.tipo_pago
              ) || null
            }
            onChange={(event, newValue) =>
              setCreateData({
                ...createData,
                tipo_pago: newValue ? newValue.clave : "",
              })
            }
          />
          <TextField
            fullWidth
            label="Fecha"
            type="date"
            InputLabelProps={{ shrink: true }}
            margin="normal"
            value={createData.fecha}
            onChange={(e) =>
              setCreateData({ ...createData, fecha: e.target.value })
            }
            error={!!errors.fecha}
            helperText={errors.fecha}
          />
          <TextField
            fullWidth
            label="Descripción"
            margin="normal"
            value={createData.descripcion}
            onChange={(e) =>
              setCreateData({ ...createData, descripcion: e.target.value })
            }
            error={!!errors.descripcion}
            helperText={errors.descripcion}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateSubmit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Stack direction="row" spacing={1}>
          <Tooltip title="Exportar a Excel">
            <IconButton color="primary" onClick={exportToExcel}>
              <img
                src={excelIcon}
                alt="Exportar a Excel"
                style={{ width: "40px", height: "40px" }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar a PDF">
            <IconButton color="secondary" onClick={exportToPDF}>
              <img
                src={pdfIcon}
                alt="Exportar a PDF"
                style={{ width: "40px", height: "40px" }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#3c64a3" }}>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", minWidth: "20%", color: "white" }}
              >
                Fecha
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", minWidth: "25%", color: "white" }}
              >
                Cantidad
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", minWidth: "20%", color: "white" }}
              >
                Tipo de Pago
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", minWidth: "20%", color: "white" }}
              >
                Descripción
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", minWidth: "15%", color: "white" }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.fecha}</TableCell>
                  <TableCell>{formatCurrency(row.cantidad)}</TableCell>
                  <TableCell>{row.tipo_pago}</TableCell>
                  <TableCell>{row.descripcion}</TableCell>
                  <TableCell>
                    <Tooltip title="Eliminar">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(row.id)}
                      >
                        <img
                          src={deleteIcon}
                          alt="Eliminar"
                          style={{ width: "25px", height: "25px" }}
                        />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            <TableRow>
              <TableCell colSpan={1} sx={{ fontWeight: "bold" }}>
                Total:
              </TableCell>
              <TableCell>{formatCurrency(calculateTotal())}</TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) =>
          setRowsPerPage(parseInt(event.target.value, 10))
        }
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `Mostrando ${from} - ${to} de ${
            count !== -1 ? count : `más de ${to}`
          } Registros`
        }
      />
    </div>
  );
};

export default ExpenseForm;
