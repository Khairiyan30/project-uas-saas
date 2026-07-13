import type { SupabaseClient } from "@supabase/supabase-js";

export interface ProjectAccess {
  allowed: boolean;
  isOwner: boolean;
  isClient: boolean;
  project: any | null;
}

/**
 * Check if a user can access a project.
 * Owner: full access. Assigned client (accepted): read-only access.
 */
export async function canAccessProject(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
): Promise<ProjectAccess> {
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, user_id, name, event_type, description, progress_status, unique_slug, created_at, cover_photo_url")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    return { allowed: false, isOwner: false, isClient: false, project: null };
  }

  const isOwner = project.user_id === userId;

  if (isOwner) {
    return { allowed: true, isOwner: true, isClient: false, project };
  }

  // Check if user is an assigned client (accepted)
  const { data: assignment } = await supabase
    .from("project_clients")
    .select("accepted_at")
    .eq("project_id", projectId)
    .eq("client_id", userId)
    .single();

  if (assignment?.accepted_at) {
    return { allowed: true, isOwner: false, isClient: true, project };
  }

  return { allowed: false, isOwner: false, isClient: false, project: null };
}

/**
 * Check if user is the project owner.
 */
export async function isProjectOwner(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

/**
 * Check if user is an assigned (accepted) client of a project.
 */
export async function isAssignedClient(
  supabase: SupabaseClient,
  projectId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("project_clients")
    .select("accepted_at")
    .eq("project_id", projectId)
    .eq("client_id", userId)
    .not("accepted_at", "is", null)
    .single();
  return !!data;
}
