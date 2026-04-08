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
      cell: info => <span className="font-mono text-blue-400">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('City', {
      header: 'City',
      cell: info => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor('Category', {
      header: 'Department',
      cell: info => <span className="text-slate-300">{info.getValue() === 'IT' ? 'IT' : 'Facilities'}</span>,
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
        else if (sev === 'medium') color = 'text-blue-500 bg-blue-500/10';
        
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${color}`}>
          {sev}
        </span>
      },
    }),
    columnHelper.accessor('Status', {
      header: 'Status',
      cell: info => (
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${info.getValue().toLowerCase() === 'closed' ? 'text-success' : 'text-slate-300'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${info.getValue().toLowerCase() === 'closed' ? 'bg-success' : 'bg-slate-400 animate-pulse'}`}></span>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('CreatedOn', {
      header: 'Created Date',
      cell: info => <span className="text-[11px] text-slate-400 tabular-nums">{info.getValue()}</span>,
    }),
    columnHelper.accessor('Ageing', {
      header: 'Resolution / Age',
      cell: info => <span className="font-mono text-[11px]">{info.getValue() || '--'}</span>,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
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
        row.City,
        row.Category,
        `"${row.Title.replace(/"/g, '""')}"`,
        row.Severity,
        row.Status,
        `"${row.CreatedOn}"`,
        row.Ageing
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
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Enterprise Data Table</h3>
        
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-700 text-xs px-3 py-1.5 rounded-lg w-48 focus:ring-1 ring-blue-500 outline-none text-slate-200"
          />
          <button 
            onClick={exportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-900/80 border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-500">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-3 px-4 font-semibold cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={header.column.getToggleSortingHandler()}>
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="w-3 h-3" />,
                        desc: <ChevronDown className="w-3 h-3" />,
                      }[header.column.getIsSorted() as string] ?? <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-3 px-4 text-slate-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing {table.getRowModel().rows.length} of {data.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <span className="px-2">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
          <button 
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
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
