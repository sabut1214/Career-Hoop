import { Navbar } from "@/shared/components/layout/navbar"
import { Footer } from "@/shared/components/layout/footer"
import { Badge } from "@/shared/components/ui/badge"
import { SectionContainer } from "@/shared/components/layout/section-container"
import { Scale, AlertCircle, CheckCircle, FileCheck } from "lucide-react"

export default function TermsOfService() {
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
            Terms of <span className="text-primary">Service</span>
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
                <Scale className="h-6 w-6 text-primary" />
                1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using areerHoop, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                2. Use License
              </h2>
              <p className="mb-4">
                Permission is granted to temporarily use areerHoop for personal, non-commercial purposes. This license does not include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose</li>
                <li>Attempting to reverse engineer any software contained on the platform</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-primary" />
                3. User Accounts
              </h2>
              <p className="mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileCheck className="h-6 w-6 text-primary" />
                4. Subscription and Payments
              </h2>
              <p className="mb-4">
                areerHoop offers both free and premium subscription plans:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Free plans provide basic features and limited access</li>
                <li>Premium (PRO) plans require payment and provide full access</li>
                <li>Subscriptions are billed in advance and are non-refundable</li>
                <li>You may cancel your subscription at any time</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Prohibited Uses
              </h2>
              <p className="mb-4">
                You may not use areerHoop:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>In any way that violates applicable laws or regulations</li>
                <li>To transmit any malicious code or viruses</li>
                <li>To impersonate or attempt to impersonate another user</li>
                <li>To engage in any automated use of the system</li>
                <li>To interfere with or disrupt the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Limitation of Liability
              </h2>
              <p className="mb-4">
                areerHoop provides career guidance and recommendations for informational purposes only. We do not guarantee specific outcomes, job placements, or admission to educational institutions. You are solely responsible for your career and educational decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                7. Contact Information
              </h2>
              <p className="mb-4">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="mb-4">
                <strong>Email:</strong> legal@careerhoop.com<br />
                <strong>Address:</strong> areerHoop, Legal Department
              </p>
            </section>
          </div>
        </div>
      </SectionContainer>

      <Footer />
    </div>
  )
}
