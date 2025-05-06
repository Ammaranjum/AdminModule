import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with your project URL and service role key
// I used this to file to create a dummy user for testing purposes 
const supabase = createClient(
  "https://djcwtdzvvtksmwnicgwh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqY3d0ZHp2dnRrc213bmljZ3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAxMjAwOCwiZXhwIjoyMDYxNTg4MDA4fQ.71r-JzHmVJsWttVDRWh9JyM7r9s6CZvxnYK_t14hzmU"
);

async function ensureAdminUser() {
  try {
    // Fetch all users
    const { data, error: fetchError } = await supabase.auth.admin.listUsers();

    if (fetchError) {
      throw new Error(`Error fetching users: ${fetchError.message}`);
    }

    // Access the users array
    const users = data.users;

    // Find the user with the specified email
    const user = users.find((u) => u.email === "admin@email.com");

    if (user) {
      const userId = user.id;

      // Update the user
      const { data: updatedUser, error } =
        await supabase.auth.admin.updateUserById(userId, {
          password: "password123", // Update the password
          user_metadata: { role: "admin" }, // Update the role metadata
        });

      if (error) {
        console.error("Error updating admin user:", error);
      } else {
        console.log("Admin user updated:", updatedUser);
      }
    } else {
      // Create a new user if not found
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: "admin@email.com",
          password: "password123",
          user_metadata: { role: "admin" },
        });

      if (createError) {
        console.error("Error creating admin user:", createError);
      } else {
        console.log("Admin user created:", newUser);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

ensureAdminUser();
