import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadWithSignedUrl(file, signed) {
    const { bucket, path, token } = signed;
    const { error } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(path, token, file, { contentType: file.type });

    if (error) {
        throw new Error(error.message || "Upload failed");
    }

    const { data, error: urlError } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

    if (urlError) {
        throw new Error(urlError.message || "Failed to get public URL");
    }

    return data.publicUrl;
}

export default supabase;
