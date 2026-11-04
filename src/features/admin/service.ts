import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase';

const emailSchema = z.string().trim().email();

export async function promoteUserToAdmin(email: string): Promise<void> {
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    throw new Error('Enter a valid email address.');
  }

  const { error } = await getSupabaseClient().rpc('promote_user_to_admin', {
    target_email: parsedEmail.data.toLowerCase(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
