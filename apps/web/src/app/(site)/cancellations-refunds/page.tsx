import { LegalDocumentPage } from '@/components/LegalDocumentPage';

export default function CancellationsRefundsPage() {
  return (
    <LegalDocumentPage
      title="Cancellations and Refunds Page"
      intro=""
      sections={[
        {
          body: [
            'K Keerthi believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy: Cancellations will be considered only if the request is made within 1 day of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them. K Keerthi does not accept cancellation requests for digital products like ebooks, courses and practice exams. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good or damaged or inappropriate. In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 1 day of receipt of the products. In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 1 day of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision. In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them. In case of any Refunds approved by the K Keerthi, it will take 3-5 working days for the refund to be processed to the end customer.',
          ],
        },
      ]}
    />
  );
}
