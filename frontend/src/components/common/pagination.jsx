"use client"

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = []

  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.push(i)
  }

  return (
    <div className="flex justify-center items-center gap-2 my-8">
      <button 
        className="px-3 py-2 border border-border bg-card text-foreground rounded-md font-medium transition-all hover:border-primary hover:text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground disabled:hover:bg-card" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {currentPage > 3 && (
        <>
          <button 
            className="px-3 py-2 border border-border bg-card text-foreground rounded-md font-medium transition-all hover:border-primary hover:text-primary hover:bg-primary/10" 
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          <span className="text-muted-foreground px-2">...</span>
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-2 border rounded-md font-medium transition-all ${
            page === currentPage
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-card text-foreground hover:border-primary hover:text-primary hover:bg-primary/10"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          <span className="text-muted-foreground px-2">...</span>
          <button 
            className="px-3 py-2 border border-border bg-card text-foreground rounded-md font-medium transition-all hover:border-primary hover:text-primary hover:bg-primary/10" 
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="px-3 py-2 border border-border bg-card text-foreground rounded-md font-medium transition-all hover:border-primary hover:text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground disabled:hover:bg-card"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
