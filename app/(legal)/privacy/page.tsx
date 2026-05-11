import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Smart ATS",
  description: "How Smart ATS collects, uses, and protects personal data.",
};

const EFFECTIVE_DATE = "11 May 2026";

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-400 !mt-0">Effective: {EFFECTIVE_DATE}</p>

      <p>
        Smart ATS (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;, &ldquo;<strong>our</strong>&rdquo;)
        provides an AI-powered applicant tracking and screening platform for recruiters. This policy explains
        what personal data we collect, why we collect it, how we use it, and the rights you have over it.
      </p>

      <p>
        This policy is written to comply with India&rsquo;s <strong>Digital Personal Data Protection Act, 2023
        (DPDP Act)</strong> and reflects practices that align with the EU GDPR and California CCPA where applicable.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Smart ATS is operated from India. For questions about this policy or your data, contact us at{" "}
        <a href="mailto:privacy@smartats.in">privacy@smartats.in</a>.
      </p>

      <h2>2. Who this policy applies to</h2>
      <p>
        Smart ATS is a <strong>business-to-business</strong> tool intended only for recruiters, hiring managers
        and HR professionals (&ldquo;<strong>Users</strong>&rdquo;). Job candidates do not interact with Smart ATS
        directly; their data is uploaded into the platform by a recruiter.
      </p>
      <ul>
        <li>
          <strong>For Users</strong> — we are the data fiduciary (controller) of your account information.
        </li>
        <li>
          <strong>For candidate data</strong> uploaded by a User — the User is the data fiduciary; we act as
          the data processor, handling that data on the User&rsquo;s instructions. See our{" "}
          <a href="/dpa">Data Processing Agreement</a>.
        </li>
      </ul>

      <h2>3. Data we collect</h2>

      <h3>3.1 Account data (from Users)</h3>
      <ul>
        <li>Name, work email, profile photo — from Google when you sign in</li>
        <li>Company, industry, recruiter category — entered by you</li>
        <li>Booking link (e.g. Calendly URL) — entered by you</li>
      </ul>

      <h3>3.2 Candidate data (uploaded by Users)</h3>
      <ul>
        <li>Resume / CV file contents (PDF, DOCX, TXT) parsed to text</li>
        <li>Name, email, phone, location, current role and employer</li>
        <li>Skills, years of experience, notice period, current/expected salary</li>
        <li>Notes, tags, interview feedback and decisions recorded by the User</li>
        <li>Communications drafted or logged in the platform</li>
      </ul>
      <p>
        We do not solicit and ask Users not to upload sensitive personal data (financial account numbers,
        biometric data, health data, government IDs).
      </p>

      <h3>3.3 Usage and technical data</h3>
      <ul>
        <li>Pages viewed, actions taken (event analytics)</li>
        <li>Device type, browser, operating system</li>
        <li>IP address (truncated where possible) and approximate region</li>
        <li>Authentication cookies set by next-auth</li>
      </ul>

      <h2>4. How we use your data</h2>
      <ul>
        <li><strong>Provide the service</strong> — store your jobs and candidates, run AI screening, generate outreach drafts</li>
        <li><strong>Authenticate</strong> you and keep the account secure</li>
        <li><strong>Improve the product</strong> — aggregate usage analytics, error monitoring</li>
        <li><strong>Communicate with you</strong> — operational emails, updates about features you use</li>
        <li><strong>Comply with law</strong> — respond to lawful requests, prevent fraud or abuse</li>
      </ul>
      <p>
        <strong>We do not train AI models on your data.</strong> Candidate text we send to AI providers is used
        only to return a result to your session.
      </p>

      <h2>5. Legal bases for processing</h2>
      <p>Under the DPDP Act we rely on the following grounds:</p>
      <ul>
        <li><strong>Consent</strong> — given by you when you create an account and accept this policy</li>
        <li>
          <strong>Legitimate uses</strong> — providing the service you signed up for, securing the platform,
          complying with legal obligations
        </li>
        <li>
          <strong>Processor instructions</strong> — for candidate data, we act on documented instructions from
          the User who controls it
        </li>
      </ul>

      <h2>6. Sub-processors and third parties</h2>
      <p>We share data with the following service providers strictly to operate the service:</p>
      <ul>
        <li><strong>Anthropic, PBC (USA)</strong> — AI inference. Resume and job description text is sent for screening, drafting and analysis. Anthropic does not retain prompts for model training.</li>
        <li><strong>Vercel Inc. (USA)</strong> — application hosting and edge delivery</li>
        <li><strong>Neon Inc. (USA / EU)</strong> — managed PostgreSQL database</li>
        <li><strong>Google LLC (USA)</strong> — OAuth sign-in</li>
        <li><strong>PostHog Inc. (USA / EU)</strong> — product analytics (only with your consent — see &sect;9)</li>
      </ul>
      <p>
        We do not sell personal data. We do not share data with advertisers.
      </p>

      <h2>7. Cross-border transfers</h2>
      <p>
        Several of our sub-processors operate outside India. Under section 16 of the DPDP Act, transfers are
        permitted unless restricted by the Central Government. We rely on the contractual safeguards of each
        provider (Anthropic, Vercel, Neon, Google, PostHog) and limit transfers to what is necessary to deliver
        the service.
      </p>

      <h2>8. Data retention</h2>
      <ul>
        <li><strong>Account data</strong> — kept while your account is active. Deleted within 30 days of account deletion.</li>
        <li><strong>Candidate data</strong> — kept while the User retains it. Users may delete individual candidates at any time, or delete their account to remove all candidate data.</li>
        <li><strong>Backups</strong> — encrypted backups are retained up to 30 days after deletion.</li>
        <li><strong>Aggregated usage metrics</strong> — kept indefinitely in de-identified form.</li>
      </ul>

      <h2>9. Cookies and analytics</h2>
      <p>We use two categories of cookies and similar storage:</p>
      <ul>
        <li><strong>Strictly necessary</strong> — authentication cookies. The service cannot function without them and they are always on.</li>
        <li><strong>Analytics (PostHog)</strong> — only set after you accept the cookie banner. You can withdraw consent at any time from the banner that re-appears, or by contacting us.</li>
      </ul>
      <p>We do not use advertising or cross-site tracking cookies.</p>

      <h2>10. Your rights</h2>
      <p>Under the DPDP Act and similar laws, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> — see what personal data we hold about you</li>
        <li><strong>Correction</strong> — fix inaccurate data (edit it in the app, or write to us)</li>
        <li><strong>Erasure</strong> — delete your account (Settings &rarr; Danger zone) or write to us</li>
        <li><strong>Portability</strong> — request an export of your data in a machine-readable format</li>
        <li><strong>Grievance redressal</strong> — raise a concern with our Grievance Officer (below)</li>
        <li><strong>Nominate</strong> — under section 14 of the DPDP Act, designate a person to exercise your rights in case of death or incapacity</li>
      </ul>
      <p>
        For candidates whose data has been uploaded by a recruiter: please contact that recruiter first as
        they are the data fiduciary. If they are unresponsive, write to{" "}
        <a href="mailto:privacy@smartats.in">privacy@smartats.in</a> and we will assist.
      </p>

      <h2>11. Security</h2>
      <ul>
        <li>Data in transit encrypted with TLS 1.2+</li>
        <li>Data at rest encrypted by our cloud providers (AES-256)</li>
        <li>Authentication via Google OAuth — we never see or store your Google password</li>
        <li>Role-based access for our team; production data access is logged</li>
        <li>Resume files are parsed in memory and not stored as binaries — only the extracted text is retained</li>
        <li>Regular dependency updates and security patches</li>
      </ul>

      <h2>12. Children</h2>
      <p>
        Smart ATS is not intended for use by anyone under 18. Recruiters must not upload data of candidates
        known to be minors.
      </p>

      <h2>13. Changes to this policy</h2>
      <p>
        We will post material changes here and notify Users by email or an in-app notice at least 7 days
        before the change takes effect.
      </p>

      <h2>14. Grievance Officer</h2>
      <p>
        In accordance with the DPDP Act, our designated Grievance Officer can be reached at{" "}
        <a href="mailto:grievance@smartats.in">grievance@smartats.in</a>. We will acknowledge complaints within
        48 hours and resolve them within the statutory timeline.
      </p>

      <h2>15. Contact</h2>
      <p>
        Email: <a href="mailto:privacy@smartats.in">privacy@smartats.in</a><br />
        For data subject requests, please write from the email address associated with your account so we can
        verify the request.
      </p>
    </>
  );
}
