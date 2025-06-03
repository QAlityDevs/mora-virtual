import { supabase } from "./supabase"
import type { Database } from "./database.types"

// Event Types
export type Event = Database["public"]["Tables"]["events"]["Row"]
export type EventWithActors = Event & { actors: Actor[] }

// Actor Types
export type Actor = Database["public"]["Tables"]["actors"]["Row"]

// Seat Types
export type Seat = Database["public"]["Tables"]["seats"]["Row"]

// Ticket Types
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"]
export type TicketWithDetails = Ticket & {
  event: Event
  seat: Seat
}

// Forum Types
export type ForumPost = Database["public"]["Tables"]["forum_posts"]["Row"]
export type ForumPostWithUser = ForumPost & {
  user: {
    id: string
    name: string
    avatar_url?: string
    role?: string
  }
  replies?: ForumPostWithUser[]
}

// Events
export async function getEvents() {
  const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return data
}

export async function getEvent(id: string): Promise<EventWithActors | null> {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching event:", error)
    return null
  }

  // Get actors for this event
  const { data: eventActors } = await supabase.from("event_actors").select("actors(*)").eq("event_id", id)

  const actors = eventActors?.map((ea) => ea.actors) || []

  return {
    ...data,
    actors,
  }
}

export async function createEvent(eventData: Omit<Event, "id" | "created_at">) {
  const { data, error } = await supabase.from("events").insert([eventData]).select()

  if (error) {
    console.error("Error creating event:", error)
    throw error
  }

  return data[0]
}

export async function updateEvent(id: string, eventData: Partial<Event>) {
  const { data, error } = await supabase.from("events").update(eventData).eq("id", id).select()

  if (error) {
    console.error("Error updating event:", error)
    throw error
  }

  return data[0]
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("Error deleting event:", error)
    throw error
  }

  return true
}

// Actors
export async function getActors() {
  const { data, error } = await supabase.from("actors").select("*").order("name")

  if (error) {
    console.error("Error fetching actors:", error)
    return []
  }

  return data
}

export async function getActor(id: string) {
  const { data, error } = await supabase.from("actors").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching actor:", error)
    return null
  }

  return data
}

export async function createActor(actorData: Omit<Actor, "id" | "created_at">) {
  const { data, error } = await supabase.from("actors").insert([actorData]).select()

  if (error) {
    console.error("Error creating actor:", error)
    throw error
  }

  return data[0]
}

export async function updateActor(id: string, actorData: Partial<Actor>) {
  const { data, error } = await supabase.from("actors").update(actorData).eq("id", id).select()

  if (error) {
    console.error("Error updating actor:", error)
    throw error
  }

  return data[0]
}

export async function deleteActor(id: string) {
  const { error } = await supabase.from("actors").delete().eq("id", id)

  if (error) {
    console.error("Error deleting actor:", error)
    throw error
  }

  return true
}

// Event Actors
export async function getEventActors(eventId: string) {
  const { data, error } = await supabase
    .from("event_actors")
    .select(`
      *,
      actors(*)
    `)
    .eq("event_id", eventId)

  if (error) {
    console.error("Error fetching event actors:", error)
    return []
  }

  return data.map((item) => item.actors)
}

export async function assignActorsToEvent(eventId: string, actorIds: string[]) {
  // First delete existing assignments
  await supabase.from("event_actors").delete().eq("event_id", eventId)

  if (actorIds.length === 0) return true

  // Create new assignments
  const eventActors = actorIds.map((actorId) => ({
    event_id: eventId,
    actor_id: actorId,
  }))

  const { error } = await supabase.from("event_actors").insert(eventActors)

  if (error) {
    console.error("Error assigning actors to event:", error)
    throw error
  }

  return true
}

// Seats
export async function getEventSeats(eventId: string) {
  const { data, error } = await supabase.from("seats").select("*").eq("event_id", eventId).order("row").order("number")

  if (error) {
    console.error("Error fetching seats:", error)
    return []
  }

  return data
}

export async function createEventSeats(
  eventId: string,
  rows: string[],
  seatsPerRow: number,
  prices: Record<string, number>,
) {
  const seats = []

  for (const row of rows) {
    for (let i = 1; i <= seatsPerRow; i++) {
      seats.push({
        event_id: eventId,
        row,
        number: i,
        price: prices[row] || 0,
        status: "available",
      })
    }
  }

  const { error } = await supabase.from("seats").insert(seats)

  if (error) {
    console.error("Error creating seats:", error)
    throw error
  }

  return true
}

export async function updateSeatStatus(seatId: string, status: "available" | "reserved" | "sold") {
  const { error } = await supabase.from("seats").update({ status }).eq("id", seatId)

  if (error) {
    console.error("Error updating seat status:", error)
    throw error
  }

  return true
}

// Tickets
export async function getUserTickets(userId: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      *,
      events(*),
      seats(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user tickets:", error)
    return []
  }

  return data.map((ticket) => ({
    ...ticket,
    event: ticket.events,
    seat: ticket.seats,
  }))
}

export async function createTicket(ticketData: Omit<Ticket, "id" | "created_at">) {
  const { data, error } = await supabase.from("tickets").insert([ticketData]).select()

  if (error) {
    console.error("Error creating ticket:", error)
    throw error
  }

  return data[0]
}

export async function updateTicketStatus(ticketId: string, status: "reserved" | "purchased" | "cancelled") {
  const { error } = await supabase.from("tickets").update({ status }).eq("id", ticketId)

  if (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }

  return true
}

// Forum Posts
export async function getEventForumPosts(eventId: string) {
  // First get top-level posts
  const { data: topLevelPosts, error } = await supabase
    .from("forum_posts")
    .select(`
      *,
      user:user_id(id, name)
    `)
    .eq("event_id", eventId)
    .is("parent_id", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching forum posts:", error)
    return []
  }

  // Then get replies for each post
  const postsWithReplies = await Promise.all(
    topLevelPosts.map(async (post) => {
      const { data: replies } = await supabase
        .from("forum_posts")
        .select(`
          *,
          user:user_id(id, name)
        `)
        .eq("parent_id", post.id)
        .order("created_at", { ascending: true })

      return {
        ...post,
        replies: replies || [],
      }
    }),
  )

  return postsWithReplies
}

export async function createForumPost(postData: Omit<ForumPost, "id" | "created_at">) {
  const { data, error } = await supabase.from("forum_posts").insert([postData]).select()

  if (error) {
    console.error("Error creating forum post:", error)
    throw error
  }

  return data[0]
}

export async function deleteForumPost(postId: string) {
  const { error } = await supabase.from("forum_posts").delete().eq("id", postId)

  if (error) {
    console.error("Error deleting forum post:", error)
    throw error
  }

  return true
}

// User Profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<Database["public"]["Tables"]["users"]["Update"]>,
) {
  const { data, error } = await supabase.from("users").update(profileData).eq("id", userId).select()

  if (error) {
    console.error("Error updating user profile:", error)
    throw error
  }

  return data[0]
}

export async function getEventForum(eventId: string) {
  const { data, error } = await supabase
    .from('forums')
    .select('*, forum_messages(*)')
    .eq('event_id', eventId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createForumMessage({
  forumId,
  userId,
  content
}: {
  forumId: string;
  userId: string;
  content: string;
}) {
  return supabase
    .from('forum_messages')
    .insert({ forum_id: forumId, user_id: userId, content })
    .select()
    .single();
}
