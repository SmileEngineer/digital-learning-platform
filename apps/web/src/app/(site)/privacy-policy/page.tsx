import { LegalDocumentPage } from '@/components/LegalDocumentPage';

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      intro="This policy explains how Kantri Lawyer collects, uses, and protects learner information."
      sections={[
        {
          heading: 'Information We Collect',
          body: [
            'We may collect your name, email address, billing details, shipping details, and platform activity needed to provide orders, learning access, and support.',
            'We may also store technical information required for security, authentication, order tracking, and service reliability.',
          ],
        },
        {
          heading: 'How We Use Information',
          body: [
            'Your information is used to manage your account, process purchases, deliver digital access, validate shipping, and respond to support requests.',
            'We may also use limited operational data to improve catalog quality, platform usability, and fraud prevention controls.',
          ],
        },
        {
          heading: 'Data Protection',
          body: [
            'We take reasonable measures to protect your information and restrict access to authorized systems and personnel only.',
            'If you need help regarding your stored information, please contact us at uday@kantrilawyer.com.',
          ],
        },
      ]}
    />
  );
}
