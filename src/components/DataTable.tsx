import { Ticket } from '@/types';
import { 
  createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable 
} from '@tanstack/react-table';
import { useState } from 'react';
import { Download, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

const columnHelper = createColumnHelper<Ticket>();

export function DataTable({ data }: { data: Ticket[] }) {
  const [sorting, setSorting] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = [
    columnHelper.accessor('ID', {
      header: 'Ticket ID',
      cell: info => <span className="font-mono text-primary font-bold">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('IssueLocation', {
      header: 'City / Location',
      cell: info => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor('Category', {
      header: 'Department',
      cell: info => <span className="text-black font-bold">{info.getValue()}</span>,
    }),
    columnHelper.accessor('Title', {
      header: 'Issue Type',
      cell: info => <span className="truncate max-w-[200px] block" title={info.getValue()}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('Severity', {
      header: 'Priority',
      cell: info => {
        const sev = info.getValue().toLowerCase();
        let color = 'text-green-500 bg-green-500/10';
        if (sev === 'critical') color = 'text-red-500 bg-red-500/10';
        else if (sev === 'high') color = 'text-orange-500 bg-orange-500/10';
        else if (sev === 'medium') color = 'text-amber-500 bg-amber-500/10';
        
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${color}`}>
          {sev}
        </span>
      },
    }),
    columnHelper.accessor('Status', {
      header: 'Status',
      cell: info => (
        <span className={`flex items-center gap-2 text-xs font-bold ${info.getValue().toLowerCase() === 'closed' ? 'text-success' : 'text-black'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${info.getValue().toLowerCase() === 'closed' ? 'bg-success' : 'bg-slate-400 animate-pulse'}`}></span>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('CreatedOn', {
      header: 'Created Date',
      cell: info => <span className="text-[11px] text-slate-900 tabular-nums">{info.getValue()}</span>,
    }),
    columnHelper.accessor('Ageing', {
      header: 'Ageing',
      cell: info => <span className="font-mono text-[11px] font-bold">{info.getValue() || '--'}</span>,
    }),
    columnHelper.accessor('DuplicateOf', {
      header: 'Duplicate Reference',
      cell: info => {
        const val = info.getValue();
        if (!val) return <span className="text-slate-600 italic">--</span>;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-orange-400 font-bold uppercase">Original:</span>
            <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{val}</span>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportCSV = () => {
    const csvRows = [];
    const headers = table.getAllColumns().filter(col => col.getIsVisible()).map(col => typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id);
    csvRows.push(headers.join(','));

    data.forEach(row => {
      const values = [
        row.ID,
        row.IssueLocation,
        row.Category,
        `"${row.Title.replace(/"/g, '""')}"`,
        row.Severity,
        row.Status,
        `"${row.CreatedOn}"`,
        row.Ageing,
        `"${row.DuplicateOf || ''}"`
      ];
      csvRows.push(values.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'tickets_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden flex flex-col border border-sky-200 shadow-sm">
      <div className="p-3 border-b border-sky-100 flex flex-col md:flex-row justify-between items-center gap-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Enterprise Data Table</h3>
          <input
            type="text"
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs px-3 py-1.5 rounded-lg w-48 focus:ring-2 ring-primary/20 outline-none text-slate-900 font-medium"
          />
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Rows:</span>
            <select
              className="bg-transparent text-xs text-slate-900 outline-none cursor-pointer font-bold"
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {[10, 15, 20, 50, 100, 200].map(pageSize => (
                <option key={pageSize} value={pageSize} className="bg-white text-slate-900">
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={exportCSV}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap table-fixed">
          <thead className="bg-sky-50 border-b border-sky-100 text-[10px] uppercase tracking-widest text-black font-black">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="relative p-2 px-3 font-black hover:bg-slate-100 transition-colors group"
                    style={{ width: header.getSize() }}
                  >
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="w-3 h-3 text-primary" />,
                        desc: <ChevronDown className="w-3 h-3 text-primary" />,
                      }[header.column.getIsSorted() as string] ?? <ChevronsUpDown className="w-3 h-3 opacity-20" />}
                    </div>
                    
                    {/* Resizer Handle */}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/30 transition-colors ${
                        header.column.getIsResizing() ? 'bg-primary w-1' : 'bg-slate-200/50'
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-2 px-3 text-black font-medium text-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-2 border-t border-sky-100 bg-sky-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] font-bold text-slate-500">
        <div className="flex items-center gap-4">
          <span className="uppercase tracking-widest">
            Showing {table.getRowModel().rows.length} of {data.length} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-900 font-black transition-all active:scale-95 shadow-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <div className="flex items-center gap-1 mx-2">
            <span className="text-slate-900 font-black px-3 py-1 bg-white border border-slate-200 rounded-lg">{table.getState().pagination.pageIndex + 1}</span>
            <span className="text-slate-400">of</span>
            <span className="text-slate-900 font-black px-3 py-1 bg-white border border-slate-200 rounded-lg">{table.getPageCount()}</span>
          </div>
          <button 
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-900 font-black transition-all active:scale-95 shadow-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
