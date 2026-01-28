import { Link } from "react-router-dom"
import { GraduationCap, Github, Twitter, Linkedin, Instagram } from "lucide-react"
import { SOCIAL_LINKS } from "@/shared/utils/constants"
import logoImg from "@/assets/images/Logo.png"

const navLinks = [
  { href: "/landing", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/why-choose-us", label: "Why Choose Us" },
  { href: "/contact", label: "Contact" },
]

const socialLinks = [
  { icon: Twitter, label: "Twitter", url: SOCIAL_LINKS.TWITTER },
  { icon: Linkedin, label: "LinkedIn", url: SOCIAL_LINKS.LINKEDIN },
  { icon: Instagram, label: "Instagram", url: SOCIAL_LINKS.INSTAGRAM },
  { icon: Github, label: "GitHub", url: SOCIAL_LINKS.GITHUB },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30 px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Link to="/landing" className="mb-4 flex items-center gap-0">
              <img src={logoImg} alt="areerHoop Logo" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-foreground">
                areer<span className="text-primary">Hoop</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Empowering students to discover their perfect career path with personalized guidance and AI-powered recommendations.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-primary hover:text-primary-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <h3 className="mb-4 font-semibold text-foreground">Navigation</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground transition-[color,transform] duration-200 ease-out hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground transition-[color,transform] duration-200 ease-out hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-muted-foreground transition-[color,transform] duration-200 ease-out hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-muted-foreground transition-[color,transform] duration-200 ease-out hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 areerHoop. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
              Terms of Service
            </Link>
            <Link to="/cookies" className="transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
