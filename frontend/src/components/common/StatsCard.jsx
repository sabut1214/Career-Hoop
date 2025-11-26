import "../../styles/StatsCard.css"

export const StatsCard = ({ label, value, icon: Icon, color = "blue" }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-icon">{Icon && <Icon size={32} />}</div>
      <div className="stats-content">
        <p className="stats-label">{label}</p>
        <h2 className="stats-value">{value}</h2>
      </div>
    </div>
  )
}

export default StatsCard
