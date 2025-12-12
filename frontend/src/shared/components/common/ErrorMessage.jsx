"use client"
import "../../styles/ErrorMessage.css"

export const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  if (!message) return null

  return (
    <div className="error-message-container">
      <div className="error-message">
        <div className="error-icon">!</div>
        <div className="error-content">
          <h3>Error</h3>
          <p>{message}</p>
          <div className="error-actions">
            {onRetry && (
              <button className="btn-retry" onClick={onRetry}>
                Retry
              </button>
            )}
            {onDismiss && (
              <button className="btn-dismiss" onClick={onDismiss}>
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
