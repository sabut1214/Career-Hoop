import "../../styles/Loader.css"

export const Loader = ({ fullScreen = false, message = "Loading..." }) => {
  const containerClass = fullScreen ? "loader-fullscreen" : "loader-inline"

  return (
    <div className={containerClass}>
      <div className="spinner"></div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  )
}

export default Loader
