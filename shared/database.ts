export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, Json>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, Json>;
        Returns: Json;
      };
    };
  };
};
