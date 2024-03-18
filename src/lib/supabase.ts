import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://qdppuiqlooyinyrcxdxx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcHB1aXFsb295aW55cmN4ZHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDc5NDQ2MywiZXhwIjoyMDI2MzcwNDYzfQ.qOvIzwABzsj9-YFt91yryLWLLyKIbY9bExieilT9Zec"
);
