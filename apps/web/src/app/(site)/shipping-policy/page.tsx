import { LegalDocumentPage } from '@/components/LegalDocumentPage';

export default function ShippingPolicyPage() {
  return (
    <LegalDocumentPage
      title="Shipping Policy"
      intro=""
      sections={[
        {
          body: [
            'For Domestic (within India) buyers, orders are shipped and delivered through registered courier companies and/or speed post only. Currently we are not delivering the physical items (books) for International buyers. If they need, they can buy ebooks or courses or practice exams from the website. Physical Books Orders are shipped within 3-5 working days or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms. K Keerthi is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 3-5 working days from the date of the order and payment or as per the delivery date agreed at the time of order confirmation. Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your email ID as specified during registration or production confirmation. For any issues in utilizing our services you may contact our helpdesk on 9392907777 or uday@kantrilawyer.com',
          ],
        },
      ]}
    />
  );
}
