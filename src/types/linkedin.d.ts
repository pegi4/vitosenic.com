export interface LinkedInLocation {
  country: string;
  city: string;
  full: string;
  country_code: string;
}

export interface LinkedInBasicInfo {
  fullname?: string;
  first_name?: string;
  last_name?: string;
  headline?: string;
  public_identifier?: string;
  profile_url?: string;
  profile_picture_url?: string;
  about?: string;
  location?: LinkedInLocation;
  current_company?: string;
  [key: string]: unknown;
}

export interface LinkedInExperience {
  title: string;
  company: string;
  location?: string;
  description?: string;
  duration?: string;
  start_date?: {
    year: number;
    month: string;
  };
  is_current?: boolean;
  company_linkedin_url?: string;
  company_logo_url?: string;
  employment_type?: string;
  location_type?: string;
  skills?: string[];
  [key: string]: unknown;
}

export interface LinkedInEducation {
  school: string;
  degree?: string;
  field_of_study?: string;
  duration?: string;
  activities?: string;
  skills?: string;
  [key: string]: unknown;
}

export interface LinkedInProfile {
  basic_info?: LinkedInBasicInfo;
  experience?: LinkedInExperience[];
  education?: LinkedInEducation[];
  [key: string]: unknown;
}

export interface LinkedInPostStats {
  total_reactions?: number;
  comments?: number;
  reposts?: number;
  [key: string]: unknown;
}

export interface LinkedInPostAuthor {
  username?: string;
  [key: string]: unknown;
}

export interface LinkedInPostArticle {
  title?: string;
  url?: string;
  [key: string]: unknown;
}

export interface LinkedInResharedPost {
  text?: string;
  article?: LinkedInPostArticle;
  [key: string]: unknown;
}

export interface LinkedInPost {
  post_type?: string;
  author?: LinkedInPostAuthor;
  posted_at?: {
    date?: string;
    [key: string]: unknown;
  };
  stats?: LinkedInPostStats;
  text?: string;
  reshared_post?: LinkedInResharedPost;
  article?: LinkedInPostArticle;
  url?: string;
  [key: string]: unknown;
}

