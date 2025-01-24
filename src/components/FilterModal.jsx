import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  FormControlLabel,
  Switch,
} from "@mui/material";

const FilterModal = ({ open, onClose, onApplyFilters, paymentTypes }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    anio: currentYear,
    mes: currentMonth,
    fecha_inicial: "",
    fecha_final: "",
    tipo_pago: "",
    type_date: true,
  });

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

  // Generar opciones de años dinámicamente
  const generateYears = () => {
    const startYear = 2025;
    const endYear = currentYear + 1; // Hasta un año más del actual
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const [availableYears, setAvailableYears] = useState(generateYears());

  useEffect(() => {
    setAvailableYears(generateYears());
  }, [currentYear]);

  // Función para restablecer filtros
  const resetFilters = () => {
    setFilters({
      anio: "",
      mes: "",
      fecha_inicial: "",
      fecha_final: "",
      tipo_pago: "",
      type_date: true,
    });
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filtros</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Switch
              checked={filters.type_date}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  type_date: e.target.checked,
                  anio: e.target.checked ? currentYear : null,
                  mes: e.target.checked ? currentMonth : null,
                  fecha_inicial: !e.target.checked ? prev.fecha_inicial : null,
                  fecha_final: !e.target.checked ? prev.fecha_final : null,
                }))
              }
            />
          }
          label={filters.type_date ? "Mensual" : "Rango de Fechas"}
        />

        {filters.type_date ? (
          <>
            {/* <TextField
              label="Año"
              type="number"
              fullWidth
              margin="normal"
              value={filters.anio}
              onChange={(e) => setFilters({ ...filters, anio: e.target.value })}
            /> */}
            <Autocomplete
              options={availableYears}
              getOptionLabel={(option) => option}
              value={filters.anio?.toString() || null}
              onChange={(e, newValue) =>
                setFilters({
                  ...filters,
                  anio: newValue ? parseInt(newValue, 10) : null,
                })
              }
              renderInput={(params) => <TextField {...params} label="Año" />}
              sx={{mb:'1rem'}}
            />
            <Autocomplete
              options={months}
              getOptionLabel={(option) => option.label}
              value={
                months.find((month) => month.value === filters.mes) || null
              }
              onChange={(e, newValue) =>
                setFilters({ ...filters, mes: newValue ? newValue.value : "" })
              }
              renderInput={(params) => <TextField {...params} label="Mes" />}
              sx={{mb:'1rem'}}
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
              sx={{mb:'1rem'}}
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
              sx={{mb:'1rem'}}
            />
          </>
        )}
        <Autocomplete
          options={paymentTypes}
          getOptionLabel={(option) => option.descripcion}
          renderInput={(params) => (
            <TextField {...params} label="Tipo de Pago" />
          )}
          value={
            paymentTypes.find((type) => type.clave === filters.tipo_pago) ||
            null
          }
          onChange={(e, newValue) =>
            setFilters({
              ...filters,
              tipo_pago: newValue ? newValue.clave : "",
            })
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={resetFilters}>Borrar Filtros</Button>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => {
            onApplyFilters(filters);
          }}
        >
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterModal;
