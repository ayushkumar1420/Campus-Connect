<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js";

// replace with your Supabase credentials
const supabaseUrl = "https://jeeijebzjotcnpruatbp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZWlqZWJ6am90Y25wcnVhdGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTE0MjYsImV4cCI6MjA3MTU4NzQyNn0.j390Xl7jrS7QR5PEKjfx38ywf4nhzC7_wY1a2j_ogTs";

=======
import { createClient } from "@supabase/supabase-js";

// replace with your Supabase credentials
const supabaseUrl = "https://jeeijebzjotcnpruatbp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZWlqZWJ6am90Y25wcnVhdGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTE0MjYsImV4cCI6MjA3MTU4NzQyNn0.j390Xl7jrS7QR5PEKjfx38ywf4nhzC7_wY1a2j_ogTs";

>>>>>>> fa31864e40ebe2ace03ce81dac2347aef6cb2907
export const supabase = createClient(supabaseUrl, supabaseAnonKey);