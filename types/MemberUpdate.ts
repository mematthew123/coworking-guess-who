    export type MemberUpdate = {
      name?: string;
      profession?: string;
      company?: string;
      bio?: string;
      skills?: string[];
      interests?: string[];
      workspacePreferences?: string;
      socialLinks?: Record<string, string>;
      gameParticipation?: boolean;
    };