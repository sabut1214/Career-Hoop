import { Navbar } from "@/shared/components/layout/navbar"
import { Footer } from "@/shared/components/layout/footer"
import { Badge } from "@/shared/components/ui/badge"
import { SectionContainer } from "@/shared/components/layout/section-container"
import { Shield, Lock, Eye, FileText } from "lucide-react"

export default function PrivacyPolicy() {
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
            Privacy <span className="text-primary">Policy</span>
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
                <Shield className="h-6 w-6 text-primary" />
                1. Information We Collect
              </h2>
              <p className="mb-4">
                At areerHoop, we collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Account information (name, email address, password)</li>
                <li>Academic records and grades</li>
                <li>Career interests and preferences</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                2. How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Generate personalized career and college recommendations</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send you important updates and notifications</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                3. Data Security
              </h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure password hashing using industry-standard algorithms</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                4. Your Rights
              </h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Access and review your personal information</li>
                <li>Update or correct your information</li>
                <li>Request deletion of your account and data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of certain communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
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
