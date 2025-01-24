import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TablePagination,
  Tooltip,
  IconButton,
} from "@mui/material";
import FilterModal from "./FilterModal";
import CreateModal from "./CreateModal";
import AddMsiModal from "./AddMsiModal";
import deleteIcon from "../images/delete.png";
import Swal from "sweetalert2";
const ExpenseForm = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  // Estados iniciales para los formularios de Crear y MSI
  const initialCreateData = {
    cantidad: "",
    tipo_pago: "",
    descripcion: "",
    fecha: "",
  };

  const initialMsiData = {
    monto_compra: "",
    cantidad_meses: "",
    tipo_pago: "",
    descripcion: "",
    inicio_pagos: "",
  };
  const [data, setData] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMsiModalOpen, setIsAddMsiModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createData, setCreateData] = useState(initialCreateData);
  const [msiData, setMsiData] = useState(initialMsiData);
  const fetchData = async (
    filters = {
      anio: currentYear,
      mes: currentMonth,
      type_date: true,
    }
  ) => {
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

  useEffect(() => {
    fetchData();
    fetchPaymentTypes();
  }, []);
  const formatCurrency = (value) =>
    `$ ${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  const calculateTotal = () =>
    data
      .reduce((sum, row) => sum + parseFloat(row.cantidad || 0), 0)
      .toFixed(2);
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
          setIsLoading(true);
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
            Swal.fire({
              position: "top-center",
              icon: "success",
              title: "Eliminado exitosamente.",
              showConfirmButton: false,
              timer: 1200,
            });
            fetchData(); // Actualizar la tabla después de la eliminación
          }
        } catch (error) {
          console.error("Error deleting data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };
  return (
    <div>
      <h1>Consulta de Gastos</h1>
      <Box sx={{ mb: "1rem" }}>
        <Button
          variant="contained"
          onClick={() => setIsFilterModalOpen(true)}
          style={{ marginRight: "10px" }}
        >
          Filtros
        </Button>
      </Box>
      <Box sx={{ mb: "1rem" }}>
        <Button
          variant="contained"
          onClick={() => {
            setCreateData(initialCreateData); // Restablecer datos al abrir el modal
            setIsCreateModalOpen(true);
          }}
          style={{ marginRight: "10px" }}
        >
          Agregar Registro
        </Button>
      </Box>
      <Box sx={{ mb: "1rem" }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setMsiData(initialMsiData); // Restablecer datos al abrir el modal
            setIsAddMsiModalOpen(true);
          }}
        >
          Agregar MSI
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ marginTop: "20px" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#3c64a3" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Fecha
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Cantidad
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Tipo de Pago
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Descripción
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
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
                        disabled={isLoading}
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
        count={data.length}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) =>
          setRowsPerPage(parseInt(event.target.value, 10))
        }
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `Mostrando ${from} - ${to} de ${count}`
        }
      />

      {/* Modales */}
      <FilterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={(filters) => {
          fetchData(filters);
          setIsFilterModalOpen(false);
        }}
        paymentTypes={paymentTypes}
      />
      <CreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        paymentTypes={paymentTypes}
        onSave={fetchData}
        initialData={createData} // Pasar los valores iniciales al modal
      />
      <AddMsiModal
        open={isAddMsiModalOpen}
        onClose={() => setIsAddMsiModalOpen(false)}
        paymentTypes={paymentTypes}
        onSave={fetchData}
        initialData={msiData} // Pasar los valores iniciales al modal
      />
    </div>
  );
};

export default ExpenseForm;
