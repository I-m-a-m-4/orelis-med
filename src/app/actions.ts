// src/app/actions.ts
'use server';

import { generateAppointmentReminder, type AppointmentReminderInput } from '@/ai/flows/appointment-reminders';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/types';
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
    await initializeAdminApp();
    const auth = getAuth();
    const firestore = getFirestore();

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
  await initializeAdminApp();
  const firestore = getFirestore();
  const auth = getAuth();

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

export type GrantInfiniteAccessState = {
  message: string;
  isSuccess: boolean;
};

export async function grantInfiniteAccessAction(
    prevState: GrantInfiniteAccessState,
    formData: FormData
): Promise<GrantInfiniteAccessState> {
    await initializeAdminApp();
    const firestore = getFirestore();

    const validatedFields = grantInfiniteAccessSchema.safeParse(
        Object.fromEntries(formData.entries())
    );
    
    if (!validatedFields.success) {
        return { message: 'Invalid clinic ID.', isSuccess: false };
    }

    const { clinicId } = validatedFields.data;

    try {
        const clinicRef = firestore.collection('clinics').doc(clinicId);
        await clinicRef.update({
            'subscription.plan': 'infinite',
            'subscription.status': 'active',
        });
        revalidatePath('/super-admin');
        return { message: 'Infinite access granted successfully!', isSuccess: true };
    } catch (error) {
        console.error('Error granting infinite access:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { message: `Failed to grant access: ${errorMessage}`, isSuccess: false };
    }
}


// --- Super Admin: Set Super Admin Claim ---
export async function setSuperAdminClaim(userId: string, email: string): Promise<{ success: boolean; message: string }> {
    if (email !== 'bimex4@gmail.com') {
        return { success: false, message: 'Not authorized to become a super admin.' };
    }

    try {
        await initializeAdminApp();
        const auth = getAuth();
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
        await initializeAdminApp();
        const auth = getAuth();
        const firestore = getFirestore();

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
