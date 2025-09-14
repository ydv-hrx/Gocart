import { inngest } from "./client";
import prisma from "@/lib/prisma";

// Create user in database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event.data; // ✅ Clerk sends data inside event.data

    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0]?.email_address ?? null,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        image: data.image_url,
      },
    });

    return { message: "User created", userId: data.id };
  }
);

// Update user in database
export const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event.data;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0]?.email_address ?? null,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        image: data.image_url,
      },
    });

    return { message: "User updated", userId: data.id };
  }
);

// Delete user from database
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event.data;

    await prisma.user.delete({
      where: { id: data.id },
    });

    return { message: "User deleted", userId: data.id };
  }
);
