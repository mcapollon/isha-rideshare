import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { resend } from '@/lib/resend';

export async function POST(request) {
  try {
    const { email, title, description, pageUrl } = await request.json();
    const supabase = await createClient();

    // Insert bug report into the database
    const { data, error } = await supabase
      .from('bug_reports')
      .insert({
        email,
        title,
        description,
        page_url: pageUrl,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send an email notification to yourself
    try {
      await resend.emails.send({
        from: 'bug-report@sangharides.com',
        to: 'mckinsleyapollon@hotmail.com',
        subject: `New Bug Report: ${title}`,
        text: `A new bug report was submitted.\n\nTitle: ${title}\nDescription: ${description}\nPage URL: ${pageUrl || 'N/A'}\nEmail: ${email || 'N/A'}`,
      });
    } catch (emailError) {
      console.error('Resend email error:', emailError);
      // Still return success, but indicate email failed
      return NextResponse.json({ success: true, emailError: emailError.message });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
