import { MarketingLayout } from '@/components/marketing/layout'

export const metadata = {
  title: 'Privacy Policy — Leasarr',
  description: 'How Leasarr collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <h1 className="font-headline text-4xl font-bold text-on-surface mb-2">Privacy Policy</h1>
        <p className="text-sm text-on-surface-variant mb-12">Last updated: May 8, 2026</p>

        <Section title="1. Who we are">
          <p>
            Leasarr (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is a property management software service. Our registered business
            operates in Canada and is subject to the federal <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA)
            and Quebec&rsquo;s <em>Act respecting the protection of personal information in the private sector</em> (Law 25).
          </p>
          <p className="mt-3">
            Questions about this policy or data requests:{' '}
            <a href="mailto:privacy@leasarr.com" className="text-primary underline hover:opacity-80">privacy@leasarr.com</a>
          </p>
        </Section>

        <Section title="2. What data we collect and why">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left py-2 pr-4 font-semibold text-on-surface w-1/3">Category</th>
                <th className="text-left py-2 pr-4 font-semibold text-on-surface w-1/3">Examples</th>
                <th className="text-left py-2 font-semibold text-on-surface">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant">
              <Row
                category="Account data"
                examples="Name, email, phone, profile photo"
                purpose="Create and manage your account; send transactional emails"
              />
              <Row
                category="Property & lease data"
                examples="Property addresses, unit details, lease terms, rent amounts"
                purpose="Core product functionality"
              />
              <Row
                category="Tenant data"
                examples="Tenant names, emails, contact info"
                purpose="Manage tenancies; send portal invitations and notifications"
              />
              <Row
                category="Payment data"
                examples="Payment amounts, dates, Stripe payment intent IDs"
                purpose="Payment tracking; billing management. Card details are handled by Stripe and never touch our servers."
              />
              <Row
                category="Maintenance data"
                examples="Request descriptions, photos, vendor info"
                purpose="Maintenance request lifecycle"
              />
              <Row
                category="Usage data"
                examples="Pages visited, features used, browser type"
                purpose="Product analytics (PostHog) — only with your consent"
              />
              <Row
                category="Consent records"
                examples="Cookie consent decisions with timestamp and jurisdiction"
                purpose="Compliance with PIPEDA and Law 25"
              />
            </tbody>
          </table>
        </Section>

        <Section title="3. Cookies and analytics">
          <p>
            We use strictly necessary cookies (Supabase auth session) that are always active. We use
            analytics cookies (PostHog) only after you explicitly accept them via the cookie banner.
            You can change your preference at any time via the &ldquo;Cookie Preferences&rdquo; link in the footer
            or under Settings → Privacy.
          </p>
        </Section>

        <Section title="4. Third-party processors">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left py-2 pr-4 font-semibold text-on-surface w-1/4">Processor</th>
                <th className="text-left py-2 pr-4 font-semibold text-on-surface w-1/3">Data shared</th>
                <th className="text-left py-2 font-semibold text-on-surface">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant">
              <Row category="Supabase" examples="All user and property data" purpose="Database and authentication" />
              <Row category="PostHog" examples="Anonymous usage events, page URLs" purpose="Product analytics (consent-gated)" />
              <Row category="Stripe" examples="Email address, billing details" purpose="Payment processing and subscription management" />
              <Row category="Resend" examples="Email address, name" purpose="Transactional and notification emails" />
            </tbody>
          </table>
          <p className="mt-3 text-on-surface-variant text-sm">
            All processors are required to handle data in accordance with applicable privacy law. We maintain
            Data Processing Agreements with each processor.
          </p>
        </Section>

        <Section title="5. Data retention">
          <p>
            We retain your data for as long as your account is active. When you delete your account,
            your profile and associated data is permanently deleted from our systems within 30 days,
            except where we are required to retain it by law (e.g. billing records for tax purposes,
            retained for 7 years per CRA requirements).
          </p>
          <p className="mt-3">
            Consent audit records are retained indefinitely as required for compliance purposes.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>Under PIPEDA and Law 25, you have the right to:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-on-surface-variant">
            <li><strong className="text-on-surface">Access</strong> — request a copy of the personal information we hold about you</li>
            <li><strong className="text-on-surface">Correction</strong> — request that inaccurate or incomplete information be corrected</li>
            <li><strong className="text-on-surface">Deletion</strong> — request that your personal information be deleted (subject to legal retention obligations)</li>
            <li><strong className="text-on-surface">Portability</strong> — request your data in a structured, machine-readable format</li>
            <li><strong className="text-on-surface">Withdraw consent</strong> — withdraw consent to analytics cookies at any time via Cookie Preferences</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, email{' '}
            <a href="mailto:privacy@leasarr.com" className="text-primary underline hover:opacity-80">privacy@leasarr.com</a>.
            We will respond within 30 days.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use industry-standard measures to protect your data, including encryption in transit (TLS),
            encryption at rest (Supabase), row-level security so users can only access their own data,
            and access controls limiting who within Leasarr can access production data.
          </p>
        </Section>

        <Section title="8. Changes to this policy">
          <p>
            If we make material changes to this policy, we will notify you via email and re-prompt
            for consent where required. The &ldquo;last updated&rdquo; date at the top of this page reflects
            the most recent revision.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Privacy questions, complaints, or data requests:{' '}
            <a href="mailto:privacy@leasarr.com" className="text-primary underline hover:opacity-80">privacy@leasarr.com</a>
          </p>
          <p className="mt-3 text-on-surface-variant text-sm">
            If you are located in Quebec and believe we have not adequately addressed your concern,
            you may file a complaint with the{' '}
            <a
              href="https://www.cai.gouv.qc.ca/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:opacity-80"
            >
              Commission d&rsquo;accès à l&rsquo;information du Québec (CAI)
            </a>.
          </p>
        </Section>
      </div>
    </MarketingLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-3">{title}</h2>
      <div className="text-on-surface-variant leading-relaxed text-sm">{children}</div>
    </section>
  )
}

function Row({ category, examples, purpose }: { category: string; examples: string; purpose: string }) {
  return (
    <tr className="border-b border-outline-variant/40">
      <td className="py-2 pr-4 font-medium text-on-surface align-top">{category}</td>
      <td className="py-2 pr-4 align-top">{examples}</td>
      <td className="py-2 align-top">{purpose}</td>
    </tr>
  )
}
