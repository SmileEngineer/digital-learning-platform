import { LegalDocumentPage } from '@/components/LegalDocumentPage';

export default function TermsOfServicePage() {
  return (
    <LegalDocumentPage
      title="Terms of Service"
      intro="These terms govern the use of Kantri Lawyer digital materials, live learning products, and physical book orders."
      sections={[
        {
          heading: 'Use of the Platform',
          body: [
            'You may use this platform only for lawful personal learning purposes. Any attempt to copy, resell, redistribute, or misuse paid materials is prohibited.',
            'Access to digital products is granted to the purchasing account only and may be limited by validity period, preview rules, or download permissions.',
          ],
        },
        {
          heading: 'Orders and Access',
          body: [
            'Course, eBook, live class, practice exam, and physical book access is activated only after a valid order is recorded by the platform.',
            'Kantri Lawyer may update product descriptions, availability, pricing, and access rules whenever needed to maintain service quality and legal compliance.',
          ],
        },
        {
          heading: 'Account Responsibility',
          body: [
            'You are responsible for maintaining the confidentiality of your login credentials and for all activity performed through your account.',
            'If suspicious use, unauthorized sharing, or abuse is detected, access may be paused or revoked while the issue is reviewed.',
          ],
        },
      ]}
    />
  );
}
