import { supabase } from '@/lib/supabase';
import { sendEmail } from './email';
import { auth } from '@/lib/auth';

export interface ApplicationDocument {
  id: string;
  type: string;
  url: string;
  created_at: string;
}

export interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  move_in_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  documents: ApplicationDocument[];
}

export interface ApplicationReview {
  id: string;
  application_id: string;
  reviewer_id: string;
  status: 'approved' | 'rejected';
  notes: string;
  created_at: string;
}

export async function createApplication(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  move_in_date: string;
  property_id: string;
  documents: { type: string; url: string }[];
}) {
  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      move_in_date: new Date(data.move_in_date).toISOString(),
      property_id: data.property_id,
      status: 'pending',
    })
    .select()
    .single();

  if (error || !application) {
    throw new Error('Failed to create application');
  }

  if (data.documents.length > 0) {
    await supabase.from('application_documents').insert(
      data.documents.map((doc) => ({
        application_id: application.id,
        type: doc.type,
        url: doc.url,
      }))
    );
  }

  // Notify landlord about new application
  await sendEmail({
    to: 'landlord@example.com', // Replace with actual landlord email
    subject: 'New Application Received',
    html: `
      <h1>New Application Received</h1>
      <p>A new application has been submitted by ${data.first_name} ${data.last_name}.</p>
      <p>Application ID: ${application.id}</p>
      <p>Click the link below to view the application:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications/${application.id}">View Application</a>
    `,
  });

  return application;
}

export async function getApplication(id: string) {
  const { data: application, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !application) {
    return null;
  }

  const { data: documents } = await supabase
    .from('application_documents')
    .select('*')
    .eq('application_id', id);

  return {
    ...application,
    documents: documents || [],
  };
}

export async function getApplicationsByProperty(id: string) {
  const { data: applicationsList, error } = await supabase
    .from('applications')
    .select('*')
    .eq('property_id', id);

  if (error || !applicationsList) {
    return [];
  }

  const applicationsWithDocuments = await Promise.all(
    applicationsList.map(async (application) => {
      const { data: documents } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', application.id);

      return {
        ...application,
        documents: documents || [],
      };
    })
  );

  return applicationsWithDocuments;
}

export async function reviewApplication(
  applicationId: string,
  status: 'approved' | 'rejected',
  notes: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const { data: review, error: reviewError } = await supabase
    .from('application_reviews')
    .insert({
      application_id: applicationId,
      reviewer_id: session.user.id,
      status,
      notes,
    })
    .select()
    .single();

  if (reviewError) {
    throw new Error('Failed to create review');
  }

  await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId);

  // Notify applicant about application status
  const application = await getApplication(applicationId);
  if (application) {
    await sendEmail({
      to: application.email,
      subject: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <h1>Application ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
        <p>Your application has been ${status}.</p>
        ${notes ? `<p>Notes: ${notes}</p>` : ''}
      `,
    });
  }

  return review;
}

export async function getApplicationReviews(applicationId: string) {
  const { data: reviews, error } = await supabase
    .from('application_reviews')
    .select('*')
    .eq('application_id', applicationId);

  if (error) {
    return [];
  }

  return reviews || [];
} 