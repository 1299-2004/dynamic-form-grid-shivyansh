// src/components/DataTable.jsx
import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function DataTable() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("https://jsonplaceholder.typicode.com/comments");
      const json = await res.json(); // ~500 rows
      // Ensure 1000+ rows by repeating (and make ids unique-ish)
      const rows =
        json.length >= 1000
          ? json
          : Array.from(
              { length: Math.ceil(1000 / json.length) },
              (_, i) =>
                json.map((r) => ({
                  ...r,
                  id: r.id + i * json.length,
                }))
            )
              .flat()
              .slice(0, 1500);
      setData(rows);
    }
    load();
  }, []);

  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "id" },
      { header: "Post", accessorKey: "postId" },
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      {
        header: "Comment",
        accessorKey: "body",
        cell: (info) => <span title={info.getValue()}>{info.getValue()}</span>,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "auto",
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <h2 style={{ margin: 0 }}>Comments (1000+)</h2>
        <input
          placeholder="Search name/email/comment"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{ minWidth: 280 }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse" }}
          className="table"
        >
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      borderBottom: "1px solid #ccc",
                      padding: "8px",
                      background: "#f7f7f7",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{ asc: " ▲", desc: " ▼" }[
                      header.column.getIsSorted()
                    ] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{ borderBottom: "1px solid #eee", padding: "8px" }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <span>
          Page <b>{table.getState().pagination.pageIndex + 1}</b> of{" "}
          <b>{table.getPageCount()}</b>
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>

        <span style={{ marginLeft: 10 }}>
          Rows per page:{" "}
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </span>
      </div>
    </div>
  );
}
