import React, { useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExpenseTable = forwardRef(({ rowData, onEdit, onDelete }, ref) => {
  const gridRef = useRef(null);

  const columnDefs = [
    { headerName: "Cantidad", field: "amount", sortable: true, filter: true, flex: 1 },
    { headerName: "Tipo de Pago", field: "tipo_pago", sortable: true, filter: true, flex: 1 },
    { headerName: "Fecha", field: "date", sortable: true, filter: true, flex: 1 },
    { headerName: "Descripción", field: "description", sortable: true, filter: true, flex: 2 },
    {
      headerName: "Acciones",
      cellRenderer: (params) => {
        const handleEdit = () => onEdit(params.data);
        const handleDelete = () => onDelete(params.data);
        return (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button onClick={handleEdit}>Editar</button>
            <button onClick={handleDelete}>Eliminar</button>
          </div>
        );
      },
      flex: 1,
    },
  ];

  // Función para exportar a PDF
  const exportToPDF = (onComplete = () => {}) => {
    const doc = new jsPDF();
    const columns = columnDefs
      .filter((col) => col.headerName !== "Acciones")
      .map((col) => col.headerName || "");
    const rows = rowData.map((row) => [row.amount, row.tipo_pago, row.date, row.description]);

    autoTable(doc, {
      head: [columns],
      body: rows,
    });
    doc.save("ConsultaGastos.pdf");
    onComplete();
  };

  // Función para exportar a Excel
  const exportToExcel = (onComplete = () => {}) => {
    const rowDataToExport = rowData.map(({ amount, tipo_pago, date, description }) => ({
      Cantidad: amount,
      "Tipo de Pago": tipo_pago,
      Fecha: date,
      Descripción: description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rowDataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "ConsultaGastos.xlsx");
    onComplete();
  };

  // Función para manejar el filtro rápido
  const setQuickFilter = useCallback((filterText) => {
    if (gridRef.current) {
      gridRef.current.api.setQuickFilter(filterText);
    }
  }, []);

  // Exponer las funciones mediante ref
  useImperativeHandle(ref, () => ({
    exportToPDF,
    exportToExcel,
    setQuickFilter,
  }));

  return (
    <div className="ag-theme-alpine" style={{ height: "400px", width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        modules={[ClientSideRowModelModule]} // Registro explícito del módulo
        domLayout="autoHeight"
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
});

export default ExpenseTable;
