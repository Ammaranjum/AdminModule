import { ReactNode, useState } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  isLoading?: boolean;
  pagination?: boolean;
  itemsPerPage?: number;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = 'No data available',
  isLoading = false,
  pagination = true,
  itemsPerPage = 10
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    // Check if any field includes the search term
    return Object.entries(item as Record<string, unknown>).some(([_, value]) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = pagination 
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) 
    : filteredData;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="w-full">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-1/3"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map(item => (
                <tr key={String(item[keyField])} className="hover:bg-gray-50">
                  {columns.map((column, columnIndex) => (
                    <td
                      key={columnIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : item[column.accessor] != null
                          ? String(item[column.accessor])
                          : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-medium">{filteredData.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;