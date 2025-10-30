
// src/app/actions.ts
'use server';

import { generateAppointmentReminder, type AppointmentReminderInput } from '@/ai/flows/appointment-reminders';
import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';
import type { UserRole, Clinic, UserProfile } from '@/lib/types';
import { answerQuestion, type SupportChatInput } from '@/ai/flows/support-chat';


// --- AI Support Chat ---
export async function askSupportQuestion(input: SupportChatInput) {
    try {
        const result = await answerQuestion(input);
        return { success: true, answer: result.answer };
    } catch (error: any) {
        console.error("AI chat error:", error);
        return { success: false, answer: `Sorry, I encountered an error: ${error.message}` };
    }
}


// --- Appointment Reminder ---
export async function sendReminderAction(appointment: { patientName: string, appointmentTime: string, doctorName: string }) {
    try {
        const input: AppointmentReminderInput = {
            patientName: appointment.patientName,
            // Format date for the prompt to be more human-readable
            appointmentTime: new Date(appointment.appointmentTime).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            doctorName: appointment.doctorName,
            hospitalName: 'Orelis Clinic',
        };
        const result = await generateAppointmentReminder(input);
        return { success: true, message: `Reminder preview: "${result.reminderMessage}"` };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to generate reminder: ${errorMessage}` };
    }
}

// --- Contact Form ---
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type ContactFormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
  isSuccess: boolean;
};

export async function submitContactForm(
  prevState: ContactFormState, 
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the errors below.',
      isSuccess: false,
    };
  }
  
  console.log('Contact Form Submitted:', validatedFields.data);

  return { message: "Thank you for your message! We'll get back to you soon.", isSuccess: true };
}


// --- Add Staff Form ---
const addStaffFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'doctor', 'receptionist']),
  clinicId: z.string().min(1, 'Clinic ID is required'),
});

export type AddStaffFormState = {
  message: string;
  errors?: z.ZodError<typeof addStaffFormSchema>['formErrors']['fieldErrors'];
  isSuccess: boolean;
}

export async function addStaffAction(
  prevState: AddStaffFormState,
  formData: FormData
): Promise<AddStaffFormState> {
    const adminApp = await initializeAdminApp();
    const auth = getAuth(adminApp);
    const firestore = getFirestore(adminApp);

    const validatedFields = addStaffFormSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please correct the errors below.',
            isSuccess: false,
        };
    }

    const { email, password, name, role, clinicId } = validatedFields.data;

    try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
        });

        // Set role as a custom claim
        await auth.setCustomUserClaims(userRecord.uid, { role, clinicId });

        // Create user profile in Firestore
        await firestore.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name,
            role,
            status: 'active',
            clinicId: clinicId, 
        });

        // Add welcome notification for new clinic admins
        if (role === 'admin') {
            const clinicDoc = await firestore.collection('clinics').doc(clinicId).get();
            const clinicData = clinicDoc.data() as Clinic;
            const expiryDate = clinicData.subscription?.expiryDate ? new Date(clinicData.subscription.expiryDate).toLocaleDateString() : 'N/A';

            await firestore.collection('users').doc(userRecord.uid).collection('notifications').add({
                userId: userRecord.uid,
                clinicId,
                title: "Welcome to Orelis!",
                message: `Your clinic's trial subscription is active and will expire on ${expiryDate}.`,
                type: 'welcome',
                read: false,
                timestamp: new Date().toISOString(),
                link: '/dashboard/settings' // Or a billing page
            });
        }
        
        revalidatePath('/dashboard/staff');
        return { message: `Staff member ${name} created successfully!`, isSuccess: true };

    } catch (error: any) {
        console.error("Error creating staff:", error);
        let errorMessage = 'An unknown error occurred.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'This email address is already in use by another account.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        return { message: `Failed to add staff: ${errorMessage}`, isSuccess: false };
    }
}


// --- Update Profile Form ---
const updateProfileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  userId: z.string(),
});

export type UpdateProfileFormState = {
  message: string;
  errors?: z.ZodError<typeof updateProfileFormSchema>['formErrors']['fieldErrors'];
  isSuccess: boolean;
};

export async function updateProfileAction(
  prevState: UpdateProfileFormState,
  formData: FormData
): Promise<UpdateProfileFormState> {
  const adminApp = await initializeAdminApp();
  const firestore = getFirestore(adminApp);
  const auth = getAuth(adminApp);

  const validatedFields = updateProfileFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the errors below.',
      isSuccess: false,
    };
  }

  const { name, userId } = validatedFields.data;

  try {
    // Update display name in Firebase Auth
    await auth.updateUser(userId, { displayName: name });
    
    // Update name in Firestore
    await firestore.collection('users').doc(userId).update({ name });

    revalidatePath('/dashboard/settings');
    return { message: 'Profile updated successfully!', isSuccess: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: `Failed to update profile: ${errorMessage}`, isSuccess: false };
  }
}

// --- Super Admin: Grant Infinite Access ---
const grantInfiniteAccessSchema = z.object({
    clinicId: z.string().min(1, 'Clinic ID is required'),
});

export async function grantInfiniteAccessAction(formData: FormData): Promise<{ success: boolean; message: string }> {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);

    const validatedFields = grantInfiniteAccessSchema.safeParse(
        Object.fromEntries(formData.entries())
    );
    
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid clinic ID.' };
    }

    const { clinicId } = validatedFields.data;

    try {
        const clinicRef = firestore.collection('clinics').doc(clinicId);
        await clinicRef.update({
            'subscription.plan': 'infinite',
            'subscription.status': 'active',
            'subscription.expiryDate': null,
        });
        revalidatePath('/super-admin');
        return { success: true, message: 'Infinite access granted successfully!' };
    } catch (error) {
        console.error('Error granting infinite access:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to grant access: ${errorMessage}` };
    }
}


// --- Super Admin: Set Expiry Date ---
const setExpiryDateSchema = z.object({
    clinicId: z.string().min(1, 'Clinic ID is required'),
    expiryDate: z.string().min(1, 'Expiry date is required'),
});

export async function setExpiryDateAction(formData: FormData): Promise<{ success: boolean; message: string }> {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);

    const validatedFields = setExpiryDateSchema.safeParse(
        Object.fromEntries(formData.entries())
    );
    
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid input.' };
    }

    const { clinicId, expiryDate } = validatedFields.data;

    try {
        const clinicRef = firestore.collection('clinics').doc(clinicId);
        await clinicRef.update({
            'subscription.expiryDate': new Date(expiryDate).toISOString(),
            'subscription.status': 'active', // Ensure status is active
        });
        revalidatePath('/super-admin');
        return { success: true, message: 'Subscription expiry updated!' };
    } catch (error) {
        console.error('Error setting expiry date:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to set expiry: ${errorMessage}` };
    }
}

// --- Super Admin: Revoke Access ---
const revokeAccessSchema = z.object({
    clinicId: z.string().min(1, 'Clinic ID is required'),
});

export async function revokeAccessAction(formData: FormData): Promise<{ success: boolean; message: string }> {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);

    const validatedFields = revokeAccessSchema.safeParse(
        Object.fromEntries(formData.entries())
    );
    
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid clinic ID.' };
    }

    const { clinicId } = validatedFields.data;

    try {
        const clinicRef = firestore.collection('clinics').doc(clinicId);
        await clinicRef.update({
            'subscription.plan': 'trial',
            'subscription.status': 'expired',
        });
        revalidatePath('/super-admin');
        return { success: true, message: 'Clinic access has been revoked.' };
    } catch (error) {
        console.error('Error revoking access:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to revoke access: ${errorMessage}` };
    }
}


// --- Super Admin: Set Super Admin Claim ---
export async function setSuperAdminClaim(userId: string, email: string): Promise<{ success: boolean; message: string }> {
    if (email !== 'bimex4@gmail.com') {
        return { success: false, message: 'Not authorized to become a super admin.' };
    }

    try {
        const adminApp = await initializeAdminApp();
        const auth = getAuth(adminApp);
        await auth.setCustomUserClaims(userId, { superAdmin: true, role: 'admin' }); // Also set role to admin
        return { success: true, message: 'Super admin claim set successfully.' };
    } catch (error) {
        console.error('Error setting super admin claim:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to set claim: ${errorMessage}` };
    }
}


// --- Admin: Change Staff Role ---
const changeRoleSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    newRole: z.enum(['admin', 'doctor', 'receptionist']),
    clinicId: z.string().min(1, 'Clinic ID is required'),
});

export async function changeStaffRoleAction(formData: FormData): Promise<{ success: boolean, message: string }> {
    const validatedFields = changeRoleSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid input.' };
    }
    
    const { userId, newRole, clinicId } = validatedFields.data;

    try {
        const adminApp = await initializeAdminApp();
        const auth = getAuth(adminApp);
        const firestore = getFirestore(adminApp);

        // Update custom claims
        await auth.setCustomUserClaims(userId, { role: newRole, clinicId });
        
        // Update Firestore document
        await firestore.collection('users').doc(userId).update({ role: newRole });

        revalidatePath('/dashboard/staff');
        return { success: true, message: "Staff role updated successfully." };

    } catch (error) {
        console.error("Error changing staff role:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to update role: ${errorMessage}` };
    }
}

// --- Super Admin: Delete Clinic ---
const deleteClinicSchema = z.object({
    clinicId: z.string().min(1, 'Clinic ID is required'),
});

export async function deleteClinicAction(formData: FormData): Promise<{ success: boolean, message: string }> {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);
    const auth = getAuth(adminApp);

    const validatedFields = deleteClinicSchema.safeParse(Object.fromEntries(formData));
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid Clinic ID provided.' };
    }
    const { clinicId } = validatedFields.data;

    const batch = firestore.batch();

    try {
        // 1. Delete all patients associated with the clinic
        const patientsQuery = firestore.collection('patients').where('clinicId', '==', clinicId);
        const patientsSnapshot = await patientsQuery.get();
        patientsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // 2. Delete all appointments for the clinic
        const appointmentsQuery = firestore.collection('appointments').where('clinicId', '==', clinicId);
        const appointmentsSnapshot = await appointmentsQuery.get();
        appointmentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // 3. Delete all staff users for the clinic (from Auth and Firestore)
        const staffQuery = firestore.collection('users').where('clinicId', '==', clinicId);
        const staffSnapshot = await staffQuery.get();
        
        const staffDeletionPromises: Promise<any>[] = [];
        staffSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref); // Delete from Firestore
            staffDeletionPromises.push(auth.deleteUser(doc.id)); // Delete from Auth
        });
        await Promise.all(staffDeletionPromises);

        // 4. Delete the clinic document itself
        const clinicRef = firestore.collection('clinics').doc(clinicId);
        batch.delete(clinicRef);

        // 5. Commit all batched writes
        await batch.commit();

        revalidatePath('/super-admin');
        return { success: true, message: `Successfully deleted clinic ${clinicId} and all associated data.` };

    } catch (error: any) {
        console.error(`Error deleting clinic ${clinicId}:`, error);
        return { success: false, message: `Failed to delete clinic: ${error.message}` };
    }
}

// --- Super Admin: Broadcast Notification ---
const broadcastSchema = z.object({
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    link: z.string().optional(),
    type: z.enum(['announcement', 'info', 'warning']).default('info'),
});
export async function sendBroadcastNotificationAction(formData: FormData) {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);
    
    const validatedFields = broadcastSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { title, message, link, type } = validatedFields.data;

    try {
        const usersSnapshot = await firestore.collection('users').where('role', '==', 'admin').get();
        if (usersSnapshot.empty) {
            return { success: false, message: "No admin users found to send notifications to." };
        }

        const batch = firestore.batch();
        usersSnapshot.forEach(userDoc => {
            const user = userDoc.data() as UserProfile;
            const notificationRef = userDoc.ref.collection('notifications').doc();
            batch.set(notificationRef, {
                userId: user.uid,
                clinicId: user.clinicId,
                title,
                message,
                link: link || '',
                type,
                read: false,
                timestamp: new Date().toISOString(),
            });
        });

        await batch.commit();
        
        revalidatePath('/super-admin/notifications');
        return { success: true, message: `Broadcast sent to ${usersSnapshot.size} admins.` };

    } catch (error: any) {
        console.error("Error sending broadcast:", error);
        return { success: false, message: `Failed to send broadcast: ${error.message}` };
    }
}

// --- Blog: Image Upload ---
export async function uploadImageAction(formData: FormData): Promise<{ success: boolean; message: string; url?: string }> {
    const imageFile = formData.get('image') as File;
    const apiKey = process.env.IMGBB_API_KEY;

    if (!imageFile) {
        return { success: false, message: 'No image file provided.' };
    }
    if (!apiKey) {
        return { success: false, message: 'ImgBB API key is not configured.' };
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', imageFile);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: uploadFormData,
        });

        const result = await response.json();

        if (result.success) {
            return { success: true, message: 'Image uploaded successfully!', url: result.data.url };
        } else {
            return { success: false, message: result.error?.message || 'Failed to upload image.' };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Upload failed: ${errorMessage}` };
    }
}


// --- Blog: Save Post ---
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(['draft', 'published']),
  metaDescription: z.string().optional(),
  clinicId: z.string().optional(),
  authorId: z.string(),
  authorName: z.string(),
  featuredImage: z.string().optional(),
  postId: z.string().optional(), // for updates
});

export async function saveBlogPostAction(formData: FormData) {
  const adminApp = await initializeAdminApp();
  const firestore = getFirestore(adminApp);

  const rawData = Object.fromEntries(formData.entries());
  
  let clinicId = rawData.clinicId as string;
  if (clinicId === 'no-clinic') {
    clinicId = '';
  }

  const validatedFields = blogPostSchema.safeParse({ ...rawData, clinicId });

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid data', errors: validatedFields.error.flatten().fieldErrors };
  }

  const { postId, ...postData } = validatedFields.data;
  
  const slug = postData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const dataToSave = {
    ...postData,
    slug,
    publishedAt: postData.status === 'published' ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (postId) {
      await firestore.collection('blogPosts').doc(postId).set(dataToSave, { merge: true });
    } else {
      await firestore.collection('blogPosts').add(dataToSave);
    }
    revalidatePath('/super-admin/blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    return { success: true, message: `Blog post ${postId ? 'updated' : 'created'} successfully!` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to save post: ${errorMessage}` };
  }
}
