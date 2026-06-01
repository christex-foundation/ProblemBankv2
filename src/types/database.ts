// Hand-written Postgres row types. Mirror supabase/migrations/0001_init.sql.
// When using @supabase/supabase-js with a typed Database, the JS client returns
// these shapes verbatim — no camelCase remapping needed.

export type SubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'research_in_progress'
  | 'not_viable'
  | 'live';
export type Urgency = 'critical' | 'high' | 'medium' | 'low';

export interface UserRow {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  name: string | null;
  bio: string | null;
  githubUrl: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionRow {
  id: string;
  userId: string;
  title: string;
  description: string;
  potentialSolution: string | null;
  urgency: Urgency;
  category: string;
  status: SubmissionStatus;
  voteCount: number;
  commentCount: number;
  libraryEntryId: string | null;
  signsItsWorking: string[];
  createdAt: string;
}

export interface VoteRow {
  id: string;
  userId: string;
  submissionId: string;
  votedAt: string;
}

export interface CommentRow {
  id: string;
  userId: string;
  submissionId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
}

export interface CommentVoteRow {
  commentId: string;
  userId: string;
  votedAt: string;
}

export interface LibraryEntryRow {
  id: string;
  slug: string;
  title: string;
  problemStatement: string;
  sector: string;
  urgency: Urgency;
  kitUrl: string | null;
  demoUrl: string | null;
  infographicUrl: string | null;
  publishedAt: string | null;
  createdBy: string;
  badgeFetchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BuildRegistryRow {
  id: string;
  userId: string;
  libraryEntryId: string;
  repoUrl: string | null;
  registeredAt: string;
}

export interface BadgePingRow {
  id: string;
  libraryEntryId: string;
  pingedAt: string;
}

type WithoutDefaults<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface Database {
  public: {
    Tables: {
      User: {
        Row: UserRow;
        Insert: WithoutDefaults<UserRow, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<UserRow>;
        Relationships: [];
      };
      Submission: {
        Row: SubmissionRow;
        Insert: WithoutDefaults<
          SubmissionRow,
          'id' | 'createdAt' | 'status' | 'voteCount' | 'commentCount' | 'signsItsWorking'
        >;
        Update: Partial<SubmissionRow>;
        Relationships: [];
      };
      Vote: {
        Row: VoteRow;
        Insert: WithoutDefaults<VoteRow, 'id' | 'votedAt'>;
        Update: Partial<VoteRow>;
        Relationships: [];
      };
      Comment: {
        Row: CommentRow;
        Insert: WithoutDefaults<CommentRow, 'id' | 'createdAt' | 'parentCommentId'>;
        Update: Partial<CommentRow>;
        Relationships: [];
      };
      CommentVote: {
        Row: CommentVoteRow;
        Insert: WithoutDefaults<CommentVoteRow, 'votedAt'>;
        Update: Partial<CommentVoteRow>;
        Relationships: [];
      };
      LibraryEntry: {
        Row: LibraryEntryRow;
        Insert: WithoutDefaults<
          LibraryEntryRow,
          'id' | 'createdAt' | 'updatedAt' | 'badgeFetchCount'
        >;
        Update: Partial<LibraryEntryRow>;
        Relationships: [];
      };
      BuildRegistry: {
        Row: BuildRegistryRow;
        Insert: WithoutDefaults<BuildRegistryRow, 'id' | 'registeredAt'>;
        Update: Partial<BuildRegistryRow>;
        Relationships: [];
      };
      BadgePing: {
        Row: BadgePingRow;
        Insert: WithoutDefaults<BadgePingRow, 'id' | 'pingedAt'>;
        Update: Partial<BadgePingRow>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      gaining_traction_ids: {
        Args: { window_days?: number; min_distinct_days?: number };
        Returns: { submissionId: string }[];
      };
    };
    Enums: {
      SubmissionStatus: SubmissionStatus;
      Urgency: Urgency;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
