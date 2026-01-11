import { Link } from "react-router-dom"
import { GraduationCap, Github, Twitter, Linkedin, Instagram } from "lucide-react"
import logoImg from "@/assets/images/Logo.png"

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Career Explorer", href: "/features" },
    { name: "Colleges", href: "/colleges" },
    { name: "Pricing", href: "#" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Help Center", href: "/contact" },
    { name: "Career Guides", href: "#" },
    { name: "Student Stories", href: "/why-choose-us" },
    { name: "Partners", href: "/contact" },
  ],
}

const socialLinks = [
  { icon: Twitter, label: "Twitter" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Instagram, label: "Instagram" },
  { icon: Github, label: "GitHub" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30 px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/landing" className="mb-4 flex items-center">
              <img src={logoImg} alt="CareerHoop Logo" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-foreground">
                Career<span className="text-primary">Hoop</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Empowering students to discover their perfect career path with personalized guidance and AI-powered recommendations.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-[background-color,color,transform] duration-200 ease-out hover:bg-primary hover:text-primary-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 font-semibold text-foreground">{section.charAt(0).toUpperCase() + section.slice(1)}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href === "#" ? (
                      <a href={link.href} className="text-muted-foreground transition-[color,transform] duration-200 ease-out hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
                        {link.name}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-muted-foreground transition-[color,transform] duration-200 ease-out hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 CareerHoop. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
              Privacy Policy
            </a>
            <a href="#" className="transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
              Terms of Service
            </a>
            <a href="#" className="transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
