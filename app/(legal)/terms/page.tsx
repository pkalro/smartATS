import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Optichire",
  description: "The terms that govern your use of Optichire.",
};

const EFFECTIVE_DATE = "11 May 2026";

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-400 !mt-0">Effective: {EFFECTIVE_DATE}</p>

      <p>
        These Terms govern your use of Optichire (the &ldquo;<strong>Service</strong>&rdquo;). By signing in,
        you agree to be bound by these Terms.
      </p>

      <h2>1. Who can use the Service</h2>
      <ul>
        <li>You must be at least 18 years old.</li>
        <li>You must use the Service in the course of legitimate recruiting or hiring work.</li>
        <li>You are responsible for keeping your sign-in credentials secure.</li>
      </ul>

      <h2>2. Your account and content</h2>
      <p>
        You retain all rights to the jobs, candidate data, notes and other content (&ldquo;<strong>Your
        Content</strong>&rdquo;) that you put into the Service. You grant us a limited licence to host,
        process and display Your Content solely to operate the Service for you. We claim no ownership in Your
        Content.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You will not:</p>
      <ul>
        <li>Upload candidate data without a lawful basis (e.g. a hiring relationship or candidate consent)</li>
        <li>Upload sensitive personal data we ask you to keep out (financial accounts, biometric data, health data, government IDs)</li>
        <li>Use the Service to discriminate on grounds prohibited by applicable law</li>
        <li>Attempt to reverse engineer, scrape, or overload the Service</li>
        <li>Resell, sublicense, or white-label the Service without a written agreement</li>
        <li>Use the Service to send spam or unsolicited bulk communications</li>
        <li>Misrepresent AI-generated output as human-authored where the law requires disclosure</li>
      </ul>

      <h2>4. AI features</h2>
      <p>
        The Service uses large language models to generate screening summaries, scores, outreach drafts and
        market intelligence. <strong>AI output can be inaccurate, biased, or out-of-date.</strong> You are
        responsible for reviewing AI output before relying on it for hiring decisions, and for ensuring
        compliance with applicable employment, equal-opportunity and non-discrimination laws.
      </p>
      <p>
        Optichire scores and ratings are advisory only and do not constitute an automated decision under the
        DPDP Act &mdash; a human (you) makes the final call.
      </p>

      <h2>5. Your responsibilities as a data fiduciary</h2>
      <p>
        For candidate data you upload, you act as the data fiduciary (controller) under the DPDP Act 2023. You
        are responsible for:
      </p>
      <ul>
        <li>Having a lawful basis (typically candidate consent or a legitimate hiring use) for processing each candidate&rsquo;s data</li>
        <li>Telling candidates that you use an automated screening tool, where the law requires it</li>
        <li>Responding to access, correction and erasure requests from candidates whose data you uploaded</li>
        <li>Keeping the data in the Service accurate and up to date</li>
      </ul>
      <p>
        Our processor obligations to you are set out in the <a href="/dpa">Data Processing Agreement</a>,
        which is incorporated into these Terms.
      </p>

      <h2>6. Fees</h2>
      <p>
        The Service is currently free, subject to fair-use limits on AI calls and storage. We reserve the
        right to introduce paid tiers with advance notice. Existing data will not be deleted as part of any
        change in pricing.
      </p>

      <h2>7. Service availability</h2>
      <p>
        We aim for high availability but do not guarantee uninterrupted service. We may schedule maintenance
        windows and will try to give advance notice for material downtime.
      </p>

      <h2>8. Termination</h2>
      <ul>
        <li><strong>You</strong> can stop using the Service or delete your account at any time from Settings.</li>
        <li><strong>We</strong> may suspend or terminate accounts that violate these Terms or applicable law, or that pose a security risk.</li>
        <li>On termination, your data is deleted as described in the Privacy Policy.</li>
      </ul>

      <h2>9. Intellectual property</h2>
      <p>
        The Service, including its software, UI, and content (excluding Your Content), is owned by Optichire
        and protected by intellectual property laws. You receive a non-exclusive, non-transferable licence to
        use the Service for the duration of your account.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;. WE DISCLAIM ALL WARRANTIES,
        EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        WE DO NOT WARRANT THAT AI OUTPUT IS ACCURATE, COMPLETE OR FREE FROM BIAS.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING
        TO THE SERVICE IS LIMITED TO THE FEES YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM, OR INR 10,000,
        WHICHEVER IS GREATER. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
        OR FOR LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL.
      </p>

      <h2>12. Indemnity</h2>
      <p>
        You will indemnify us against claims arising from: (i) your violation of these Terms, (ii) your
        violation of applicable law including data protection and employment law, or (iii) Your Content,
        including any claim by a candidate that you uploaded their data unlawfully.
      </p>

      <h2>13. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of India. Any dispute will be subject to the exclusive
        jurisdiction of the courts of Bengaluru, Karnataka. Before filing a suit, you agree to first contact{" "}
        <a href="mailto:legal@optichire.com">legal@optichire.com</a> to attempt to resolve the dispute in good
        faith.
      </p>

      <h2>14. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be notified by email or in-app
        notice at least 7 days before they take effect. Continued use after the effective date constitutes
        acceptance.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms? Write to <a href="mailto:legal@optichire.com">legal@optichire.com</a>.
      </p>
    </>
  );
}
