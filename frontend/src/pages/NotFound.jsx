import { Link } from "react-router-dom"
import { Card } from "../components/common/Card"
import "../styles/pages.css"

export default function NotFound() {
  return (
    <div className="page-container not-found-container">
      <Card className="not-found-card">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </Card>
    </div>
  )
}
