"use client"

export const Pagination = ({ currentPage, totalPages, onPageChange, isLoading = false }) => {
  const pages = []
  const disableAll = isLoading

  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.push(i)
  }

  return (
    <div className="flex justify-center items-center gap-2 my-8" aria-busy={disableAll}>
      <button 
        className="px-3 py-2 border border-border bg-card text-foreground rounded-md font-medium transition-[transform,border-color,color,background-color] duration-200 ease-out active:scale-[0.98] hover:border-primary hover:text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground disabled:hover:bg-card" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1 || disableAll}
        aria-label="Previous page"
      >
        Previous
      </button>

      {currentPage > 3 && (
        <>
          <button 
            className="px-3 py-2 border border-border bg-card text-foreground rounded-md font-medium transition-[transform,border-color,color,background-color] duration-200 ease-out active:scale-[0.98] hover:border-primary hover:text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={() => onPageChange(1)}
            disabled={disableAll}
            aria-label="Go to page 1"
          >
            1
          </button>
          <span className="text-muted-foreground px-2">...</span>
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-2 border rounded-md font-medium transition-[transform,border-color,color,background-color] duration-200 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            page === currentPage
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-card text-foreground hover:border-primary hover:text-primary hover:bg-primary/10"
          }`}
          onClick={() => onPageChange(page)}
          disabled={disableAll}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          <span className="text-muted-foreground px-2">...</span>
          <button 
            className="px-3 py-2 border border-border bg-card text-foreground rounded-md font-medium transition-[transform,border-color,color,background-color] duration-200 ease-out active:scale-[0.98] hover:border-primary hover:text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={() => onPageChange(totalPages)}
            disabled={disableAll}
            aria-label={`Go to page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="px-3 py-2 border border-border bg-card text-foreground rounded-md font-medium transition-[transform,border-color,color,background-color] duration-200 ease-out active:scale-[0.98] hover:border-primary hover:text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground disabled:hover:bg-card"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disableAll}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
