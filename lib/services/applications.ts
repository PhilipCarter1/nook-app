import { db } from '@/lib/db';
import { applications, applicationDocuments, applicationReviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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
  const [application] = await db
    .insert(applications)
    .values({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      move_in_date: new Date(data.move_in_date),
      property_id: data.property_id,
      status: 'pending',
    })
    .returning();

  if (data.documents.length > 0) {
    await db.insert(applicationDocuments).values(
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
    template: 'newApplication',
    data: {
      applicationId: application.id,
      applicantName: `${data.first_name} ${data.last_name}`,
      applicationLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications/${application.id}`,
    },
  });

  return application;
}

export async function getApplication(id: string) {
  const [application] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id));

  if (!application) {
    return null;
  }

  const documents = await db
    .select()
    .from(applicationDocuments)
    .where(eq(applicationDocuments.application_id, id));

  return {
    ...application,
    documents,
  };
}

export async function getApplicationsByProperty(id: string) {
  const applicationsList = await db
    .select()
    .from(applications)
    .where(eq(applications.property_id, id));

  const applicationsWithDocuments = await Promise.all(
    applicationsList.map(async (application) => {
      const documents = await db
        .select()
        .from(applicationDocuments)
        .where(eq(applicationDocuments.application_id, application.id));

      return {
        ...application,
        documents,
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

  const [review] = await db
    .insert(applicationReviews)
    .values({
      application_id: applicationId,
      reviewer_id: session.user.id,
      status,
      notes,
    })
    .returning();

  await db
    .update(applications)
    .set({ status })
    .where(eq(applications.id, applicationId));

  // Notify applicant about application status
  const application = await getApplication(applicationId);
  if (application) {
    await sendEmail({
      to: application.email,
      template: 'applicationStatus',
      data: {
        status,
        notes,
      },
    });
  }

  return review;
}

export async function getApplicationReviews(applicationId: string) {
  return db
    .select()
    .from(applicationReviews)
    .where(eq(applicationReviews.application_id, applicationId));
} 