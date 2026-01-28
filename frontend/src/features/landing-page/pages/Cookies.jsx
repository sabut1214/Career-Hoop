import { Navbar } from "@/shared/components/layout/navbar"
import { Footer } from "@/shared/components/layout/footer"
import { Badge } from "@/shared/components/ui/badge"
import { SectionContainer } from "@/shared/components/layout/section-container"
import { Cookie, Settings, Shield, Info } from "lucide-react"

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <SectionContainer>
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="default" className="mb-4">
            Legal
          </Badge>
          <h1 className="mb-6 font-sans text-4xl font-bold leading-tight text-foreground md:text-5xl text-balance">
            Cookie <span className="text-primary">Policy</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>
      </SectionContainer>

      {/* Content Section */}
      <SectionContainer>
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Cookie className="h-6 w-6 text-primary" />
                1. What Are Cookies?
              </h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and enabling certain features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                2. Types of Cookies We Use
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">Essential Cookies</h3>
                <p className="mb-2">
                  These cookies are necessary for the website to function properly. They include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Authentication cookies:</strong> Store your login session and keep you logged in</li>
                  <li><strong>Security cookies:</strong> Help protect against unauthorized access</li>
                  <li><strong>CSRF tokens:</strong> Prevent cross-site request forgery attacks</li>
                </ul>
                <p className="text-sm italic">
                  These cookies cannot be disabled as they are essential for the service to work.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">Functional Cookies</h3>
                <p className="mb-2">
                  These cookies enhance functionality and personalization:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Preference cookies:</strong> Remember your theme settings (dark/light mode)</li>
                  <li><strong>Language cookies:</strong> Store your language preferences</li>
                  <li><strong>User data cookies:</strong> Remember your profile information</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">Analytics Cookies</h3>
                <p className="mb-2">
                  These cookies help us understand how visitors interact with our website:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Track page views and user behavior</li>
                  <li>Identify popular features and areas for improvement</li>
                  <li>Measure the effectiveness of our content</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                3. Third-Party Cookies
              </h2>
              <p className="mb-4">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Payment processors:</strong> Cookies from payment gateways (eSewa) for transaction processing</li>
                <li><strong>Analytics services:</strong> Cookies from analytics providers to understand usage patterns</li>
              </ul>
              <p className="mb-4">
                These third parties have their own privacy policies and cookie practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                4. Managing Cookies
              </h2>
              <p className="mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Browser settings:</strong> Most browsers allow you to refuse or accept cookies through their settings</li>
                <li><strong>Browser extensions:</strong> Use privacy-focused extensions to block cookies</li>
                <li><strong>Our settings:</strong> Adjust cookie preferences in your account settings (where available)</li>
              </ul>
              <p className="mb-4 text-sm italic">
                Note: Disabling certain cookies may affect the functionality of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Cookie Duration
              </h2>
              <p className="mb-4">
                We use both session cookies (temporary, deleted when you close your browser) and persistent cookies (remain on your device for a set period):
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Session cookies:</strong> Expire when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain for up to 7 days or until you log out</li>
                <li><strong>Authentication tokens:</strong> Stored securely in httpOnly cookies for security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Updates to This Policy
              </h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                7. Contact Us
              </h2>
              <p className="mb-4">
                If you have questions about our use of cookies, please contact us at:
              </p>
              <p className="mb-4">
                <strong>Email:</strong> privacy@careerhoop.com<br />
                <strong>Address:</strong> areerHoop, Privacy Department
              </p>
            </section>
          </div>
        </div>
      </SectionContainer>

      <Footer />
    </div>
  )
}
