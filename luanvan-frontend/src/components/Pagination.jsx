import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const ellipsis = <span key="ellipsis" className="px-4 py-2"><MoreHorizontal className="w-4 h-4" /></span>;

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i + 1}
          </button>
        );
      }
    } else {
      pageNumbers.push(
        <button
          key={0}
          onClick={() => handlePageChange(0)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 0 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          1
        </button>
      );

      if (currentPage > 2) {
        pageNumbers.push(ellipsis);
      }

      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        startPage = 1;
        endPage = 3;
      }

      if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
        endPage = totalPages - 2;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i + 1}
          </button>
        );
      }

      if (currentPage < totalPages - 3) {
        pageNumbers.push(ellipsis);
      }

      pageNumbers.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePageChange(totalPages - 1)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages - 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Trước
      </button>

      <div className="hidden md:flex items-center space-x-1">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        Sau
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
};

export default Pagination; 