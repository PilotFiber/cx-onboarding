import { ReactNode } from 'react'

interface Column<T> {
  key: keyof T | string
  label: string
  width?: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
}

export default function Table<T extends object>({
  columns,
  data,
  onRowClick,
  className = '',
  emptyMessage = 'No data available'
}: TableProps<T>) {
  return (
    <div className={`rounded-lg overflow-hidden shadow-sm ${className}`}>
      {/* Header with Yellow Background */}
      <div
        className="rounded-t-lg overflow-hidden"
        style={{ background: '#FFE200' }}
      >
        <div
          className="grid gap-4 px-6 py-4 text-sm font-bold"
          style={{
            color: '#18284F',
            gridTemplateColumns: columns.map(col => col.width || '1fr').join(' ')
          }}
        >
          {columns.map((column, index) => (
            <div key={index}>
              {column.label}
            </div>
          ))}
        </div>
      </div>

      {/* Body Rows */}
      <div className="bg-white rounded-b-lg">
        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`
                grid gap-4 px-6 py-4 border-b border-gray-200
                last:border-b-0 text-sm
                ${onRowClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : ''}
              `}
              style={{
                gridTemplateColumns: columns.map(col => col.width || '1fr').join(' ')
              }}
              onClick={() => onRowClick?.(row)}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(row)}
            >
              {columns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="flex items-center"
                >
                  {column.render
                    ? column.render(row)
                    : String(row[column.key as keyof T] ?? '')}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
