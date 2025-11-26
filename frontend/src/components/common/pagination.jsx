"use client"
import "../../styles/pagination.css"

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = []

  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.push(i)
  }

  return (
    <div className="pagination">
      <button className="pagination-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>

      {currentPage > 3 && (
        <>
          <button className="pagination-page" onClick={() => onPageChange(1)}>
            1
          </button>
          <span className="pagination-ellipsis">...</span>
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`pagination-page ${page === currentPage ? "active" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          <span className="pagination-ellipsis">...</span>
          <button className="pagination-page" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
