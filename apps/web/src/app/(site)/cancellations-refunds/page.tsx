import { LegalDocumentPage } from '@/components/LegalDocumentPage';

export default function CancellationsRefundsPage() {
  return (
    <LegalDocumentPage
      title="Cancellations & Refunds"
      intro="This policy explains how cancellations and refunds are handled for Kantri Lawyer orders."
      sections={[
        {
          heading: 'Digital Products',
          body: [
            'Courses, eBooks, and practice exams are digital-access products. Once access has been granted, cancellation or refund requests may not be available except where required by law or confirmed operational error.',
            'If duplicate payment, incorrect activation, or technical failure is verified, the case will be reviewed and resolved appropriately.',
          ],
        },
        {
          heading: 'Live Classes',
          body: [
            'If a live class is cancelled by the organizer, eligible enrolled users may be refunded or moved to an alternative session as applicable.',
            'If the learner is unable to attend, refund eligibility depends on the class status, timing, and the circumstances of the request.',
          ],
        },
        {
          heading: 'Physical Books',
          body: [
            'Cancellation requests for physical books may be considered before dispatch. Once dispatched, requests are subject to return review and product condition verification.',
            'For refund assistance, please contact uday@kantrilawyer.com with your order details and reason for the request.',
          ],
        },
      ]}
    />
  );
}
