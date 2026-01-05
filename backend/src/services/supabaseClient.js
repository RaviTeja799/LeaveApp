import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Test connection function (optional - can be called manually)
export async function testConnection() {
    console.log("Testing Supabase Connection...");
    try {
        // Fetch 'users' table to verify connection
        const { data, error } = await supabase
            .from('users')
            .select('uid, name, email, role')
            .limit(1);

        if (error) {
            console.error("Connection failed or 'users' table not found:", error.message);
            return false;
        }

        console.log("Successfully connected to Supabase!");
        if (data.length > 0) {
            console.log("Found existing user record:", data[0]);
        } else {
            console.log("Connected successfully, but the 'users' table is currently empty.");
        }

        // Check for 'leave_applications' table
        const { error: leaveError } = await supabase
            .from('leave_applications')
            .select('id')
            .limit(1);

        if (leaveError) {
            console.warn("Could not reach 'leave_applications' table:", leaveError.message);
        } else {
            console.log("'leave_applications' table is accessible.");
        }

        return true;
    } catch (err) {
        console.error("Unexpected Error:", err.message);
        return false;
    }
}

// Export the Supabase client as default
export default supabase;