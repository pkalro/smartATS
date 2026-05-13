import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement · Optichire",
  description: "How Optichire processes candidate data on behalf of recruiters.",
};

const EFFECTIVE_DATE = "11 May 2026";

export default function DPAPage() {
  return (
    <>
      <h1>Data Processing Agreement</h1>
      <p className="text-sm text-slate-400 !mt-0">Effective: {EFFECTIVE_DATE}</p>

      <p>
        This Data Processing Agreement (&ldquo;<strong>DPA</strong>&rdquo;) is between you, the recruiter using
        Optichire (&ldquo;<strong>Controller</strong>&rdquo; / data fiduciary), and Optichire
        (&ldquo;<strong>Processor</strong>&rdquo; / data processor). It is incorporated into our{" "}
        <a href="/terms">Terms of Service</a> and governs candidate personal data you upload.
      </p>

      <h2>1. Roles</h2>
      <ul>
        <li>You determine the purposes and means of processing candidate data: you are the data fiduciary.</li>
        <li>We process that data only on your documented instructions: we are the data processor.</li>
      </ul>

      <h2>2. Subject matter and duration</h2>
      <ul>
        <li><strong>Subject matter</strong>: storage, parsing, AI-assisted screening, search, and outreach drafting for candidates you add to the Service.</li>
        <li><strong>Duration</strong>: for as long as you maintain an account, plus the deletion windows in our Privacy Policy.</li>
        <li><strong>Categories of data subjects</strong>: job candidates whose data you choose to upload.</li>
        <li><strong>Categories of personal data</strong>: contact details, employment history, skills, resume text, recruiter notes, interview decisions, communication logs.</li>
      </ul>

      <h2>3. Our obligations</h2>
      <p>We will:</p>
      <ul>
        <li>Process candidate data only on your instructions, as expressed through your use of the Service or in writing to <a href="mailto:privacy@optichire.com">privacy@optichire.com</a>.</li>
        <li>Ensure personnel with access to candidate data are bound by confidentiality.</li>
        <li>Implement technical and organisational measures appropriate to the risk (see &sect;6).</li>
        <li>Not engage a sub-processor without first listing them in the Privacy Policy.</li>
        <li>Assist you in fulfilling data-subject requests within 7 working days of your request.</li>
        <li>Notify you without undue delay (and in any case within 72 hours) of a personal data breach affecting your data.</li>
        <li>On termination, delete or return candidate data within 30 days (encrypted backups within 30 days thereafter).</li>
      </ul>

      <h2>4. Your obligations</h2>
      <p>You will:</p>
      <ul>
        <li>Have a lawful basis for uploading each candidate&rsquo;s data (typically candidate consent or a legitimate hiring use).</li>
        <li>Provide candidates with required notice that you use an automated screening tool, where law requires it.</li>
        <li>Respond promptly to candidate access, correction, and erasure requests for candidates you uploaded.</li>
        <li>Keep candidate data in the Service accurate and minimised to what is necessary.</li>
      </ul>

      <h2>5. Sub-processors</h2>
      <p>
        You authorise us to engage the sub-processors listed in section 6 of our{" "}
        <a href="/privacy">Privacy Policy</a>: Anthropic, Vercel, Neon, Google, PostHog. We will give 30 days&rsquo;
        notice (by email or in-app) before adding a new sub-processor, giving you the chance to object by
        terminating your account.
      </p>

      <h2>6. Security measures</h2>
      <ul>
        <li>TLS 1.2+ for data in transit</li>
        <li>AES-256 at rest (provided by Neon and Vercel)</li>
        <li>OAuth-based authentication; production access role-based and logged</li>
        <li>Server-side validation of every data access by user ID</li>
        <li>Resume files parsed in memory; only extracted text is persisted</li>
        <li>Routine dependency updates and security patching</li>
        <li>Cookie consent before any non-essential tracking is set</li>
      </ul>

      <h2>7. International transfers</h2>
      <p>
        Some sub-processors operate outside India. We rely on the contractual safeguards of each provider and
        on India&rsquo;s DPDP Act provisions permitting transfers unless restricted by the Central Government.
      </p>

      <h2>8. Audits</h2>
      <p>
        On reasonable written notice (no more than once per 12 months, except after a breach), you may request
        from us evidence of compliance with this DPA, including descriptions of our security controls and
        recent attestations from our sub-processors where available.
      </p>

      <h2>9. Liability</h2>
      <p>
        Each party&rsquo;s liability under this DPA is subject to the limits in the Terms of Service.
      </p>

      <h2>10. Changes</h2>
      <p>
        Material changes will be notified with at least 7 days&rsquo; notice. Continued use of the Service
        constitutes acceptance.
      </p>

      <p>
        Questions? Write to <a href="mailto:privacy@optichire.com">privacy@optichire.com</a>.
      </p>
    </>
  );
}
