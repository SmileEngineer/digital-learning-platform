import type { NeonQueryFunction } from '@neondatabase/serverless';

type NotifyUserInput = {
  userId: string;
  email: string;
  kind: string;
  title: string;
  message: string;
  relatedItemId?: string | null;
  relatedOrderId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function notifyUser(
  sql: NeonQueryFunction<false, false>,
  input: NotifyUserInput
): Promise<void> {
  const metadata = input.metadata ?? {};

  await sql`
    INSERT INTO notifications (
      user_id,
      channel,
      kind,
      title,
      message,
      recipient_email,
      related_item_id,
      related_order_id,
      status,
      metadata
    )
    VALUES (
      ${input.userId},
      'in_app',
      ${input.kind},
      ${input.title},
      ${input.message},
      ${input.email},
      ${input.relatedItemId ?? null},
      ${input.relatedOrderId ?? null},
      'sent',
      ${JSON.stringify(metadata)}::jsonb
    ),
    (
      ${input.userId},
      'email',
      ${input.kind},
      ${input.title},
      ${input.message},
      ${input.email},
      ${input.relatedItemId ?? null},
      ${input.relatedOrderId ?? null},
      'sent',
      ${JSON.stringify(metadata)}::jsonb
    )
  `;
}
