export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          name: string
          role: "admin" | "user" | "actor"
        }
        Insert: {
          id: string
          created_at?: string
          name: string
          role?: "admin" | "user" | "actor"
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: "admin" | "user" | "actor"
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          date: string
          time: string
          image_url: string
          sale_start_time: string
          status: "upcoming" | "active" | "completed"
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          date: string
          time: string
          image_url?: string
          sale_start_time: string
          status?: "upcoming" | "active" | "completed"
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          date?: string
          time?: string
          image_url?: string
          sale_start_time?: string
          status?: "upcoming" | "active" | "completed"
        }
      }
      actors: {
        Row: {
          id: string
          created_at: string
          name: string
          bio: string
          photo_url: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          bio: string
          photo_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          bio?: string
          photo_url?: string
        }
      }
      event_actors: {
        Row: {
          id: string
          event_id: string
          actor_id: string
        }
        Insert: {
          id?: string
          event_id: string
          actor_id: string
        }
        Update: {
          id?: string
          event_id?: string
          actor_id?: string
        }
      }
      queue: {
        Row: {
          id: string
          created_at: string
          user_id: string
          event_id: string
          position: number
          status: "waiting" | "active" | "completed" | "expired"
          token: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          event_id: string
          position: number
          status?: "waiting" | "active" | "completed" | "expired"
          token: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          event_id?: string
          position?: number
          status?: "waiting" | "active" | "completed" | "expired"
          token?: string
        }
      }
      seats: {
        Row: {
          id: string
          event_id: string
          row: string
          number: number
          price: number
          status: "available" | "reserved" | "sold"
        }
        Insert: {
          id?: string
          event_id: string
          row: string
          number: number
          price: number
          status?: "available" | "reserved" | "sold"
        }
        Update: {
          id?: string
          event_id?: string
          row?: string
          number?: number
          price?: number
          status?: "available" | "reserved" | "sold"
        }
      }
      tickets: {
        Row: {
          id: string
          created_at: string
          user_id: string
          event_id: string
          seat_id: string
          purchase_date: string
          status: "reserved" | "purchased" | "cancelled"
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          event_id: string
          seat_id: string
          purchase_date?: string
          status?: "reserved" | "purchased" | "cancelled"
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          event_id?: string
          seat_id?: string
          purchase_date?: string
          status?: "reserved" | "purchased" | "cancelled"
        }
      }
      forum_posts: {
        Row: {
          id: string
          created_at: string
          event_id: string
          user_id: string
          content: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          user_id: string
          content: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
        }
      }
    }
  }
}
