import React, { useState, useMemo } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyIcon?: string;
  isLoading?: boolean;
}

const alignClasses: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function DataTableInner<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Aucune donnee disponible',
  emptyIcon = 'inbox',
  isLoading = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null || bVal == null) return 0;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const renderSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {columns.map((col, colIdx) => (
            <td key={colIdx} className="px-8 py-6">
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-8 py-5 ${alignClasses[col.align || 'left']} ${
                    col.sortable
                      ? 'cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors'
                      : ''
                  }`}
                  onClick={() => handleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="material-symbols-outlined text-xs text-primary">
                        {sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                    {col.sortable && sortKey !== col.key && (
                      <span className="material-symbols-outlined text-xs opacity-30">
                        unfold_more
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              renderSkeleton()
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-zinc-300 dark:text-zinc-600">
                        {emptyIcon}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-400">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(item)}
                  className={`
                    hover:bg-zinc-50 dark:hover:bg-zinc-800/20
                    transition-all group
                    ${onRowClick ? 'cursor-pointer active:bg-zinc-100 dark:active:bg-zinc-800/40' : ''}
                  `}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-8 py-6 text-sm font-bold text-zinc-600 dark:text-zinc-300 ${
                        alignClasses[col.align || 'left']
                      }`}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const DataTable = DataTableInner;
export default DataTable;
