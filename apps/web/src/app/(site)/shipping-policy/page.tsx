import { LegalDocumentPage } from '@/components/LegalDocumentPage';

export default function ShippingPolicyPage() {
  return (
    <LegalDocumentPage
      title="Shipping Policy"
      intro="This policy applies to physical book orders placed through Kantri Lawyer."
      sections={[
        {
          heading: 'Delivery Coverage',
          body: [
            'Physical book shipments are subject to service availability for the provided PIN code. Delivery timelines may vary by region, logistics availability, and stock readiness.',
            'Shipping validation may be re-checked during checkout to confirm that the delivery address is serviceable.',
          ],
        },
        {
          heading: 'Processing and Dispatch',
          body: [
            'Orders are processed after successful payment confirmation. Dispatch timing may vary depending on stock position and operational conditions.',
            'Estimated delivery timelines are indicative and may change because of courier delays, holidays, weather, or other external factors.',
          ],
        },
        {
          heading: 'Address Accuracy',
          body: [
            'Please provide complete and accurate shipping information, including phone number and PIN code, to avoid delay or failed delivery attempts.',
            'Kantri Lawyer is not responsible for delays caused by incomplete or incorrect address details entered by the customer.',
          ],
        },
      ]}
    />
  );
}
