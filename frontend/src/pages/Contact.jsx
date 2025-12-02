import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, Building } from "lucide-react"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Our team typically responds within 24 hours",
    value: "hello@careerhoop.com",
    link: "mailto:hello@careerhoop.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri from 9am to 6pm EST",
    value: "+1 (555) 123-4567",
    link: "tel:+15551234567",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello at our HQ",
    value: "123 Innovation Way, San Francisco, CA 94105",
    link: "#",
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "We're here when you need us",
    value: "Monday - Friday, 9am - 6pm EST",
    link: "#",
  },
]

const faqs = [
  {
    question: "Is CareerHoop free for students?",
    answer:
      "Yes! CareerHoop is completely free for students. We believe every student deserves access to quality career guidance regardless of their financial situation.",
  },
  {
    question: "How does the AI recommendation system work?",
    answer:
      "Our AI analyzes your academic performance, interests, personality traits, and career preferences to match you with suitable career paths. It considers job market trends and growth projections to ensure relevance.",
  },
  {
    question: "Can I connect with mentors in my field of interest?",
    answer:
      "We have over 2,000 verified professionals across various industries who volunteer their time to mentor students. You can browse mentors by industry and book virtual sessions.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply create a free account, complete your profile, take our interest assessment, and you'll receive personalized career recommendations within minutes!",
  },
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Contact Us
          </div>
          <h1 className="mb-6 font-sans text-4xl font-bold leading-tight text-foreground md:text-5xl text-balance">
            We'd Love to <span className="text-primary">Hear From You</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Have questions about CareerHoop? Want to partner with us? Or just want to say hi? We're here to help and
            would love to connect with you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="bg-muted/50 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method) => (
              <Card key={method.title} className="border-border/50 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <method.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">{method.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{method.description}</p>
                  <a href={method.link} className="text-sm font-medium text-primary hover:underline">
                    {method.value}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Send us a Message</h2>
                </div>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {submitted ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Send className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button className="mt-6 bg-transparent" variant="outline" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Your Name</label>
                      <Input
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Email Address</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Subject</label>
                    <Input
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Message</label>
                    <Textarea
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
                </div>
                <p className="text-muted-foreground">Quick answers to questions you might have.</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq) => (
                  <Card key={faq.question} className="border-border/50 bg-card">
                    <CardContent className="p-6">
                      <h3 className="mb-2 font-semibold text-foreground">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Partnership CTA */}
              <Card className="mt-8 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">Interested in Partnership?</h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        We partner with schools, colleges, and organizations to bring CareerHoop to more students.
                      </p>
                      <Button variant="outline" size="sm">
                        Learn About Partnerships
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
