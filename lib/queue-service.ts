import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

export async function joinQueue(userId: string, eventId: string) {
  try {
    // Check if user is already in queue
    const { data: existingQueue } = await supabase
      .from("queue")
      .select("*")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .eq("status", "waiting")
      .single()

    if (existingQueue) {
      return { success: true, data: existingQueue }
    }

    // Get the current highest position
    const { data: highestPosition } = await supabase
      .from("queue")
      .select("position")
      .eq("event_id", eventId)
      .order("position", { ascending: false })
      .limit(1)
      .single()

    const nextPosition = highestPosition ? highestPosition.position + 1 : 1
    const token = uuidv4()

    // Add user to queue
    const { data, error } = await supabase.from("queue").insert([
      {
        user_id: userId,
        event_id: eventId,
        position: nextPosition,
        status: "waiting",
        token,
      },
    ])

    if (error) throw error

    return { success: true, data: { token, position: nextPosition } }
  } catch (error) {
    console.error("Error joining queue:", error)
    return { success: false, error }
  }
}

export async function getQueuePosition(token: string) {
  try {
    const { data, error } = await supabase.from("queue").select("*").eq("token", token).single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error getting queue position:", error)
    return { success: false, error }
  }
}

export async function activateNextInQueue(eventId: string, count = 1) {
  try {
    // Get the next users in queue
    const { data: usersToActivate } = await supabase
      .from("queue")
      .select("*")
      .eq("event_id", eventId)
      .eq("status", "waiting")
      .order("position", { ascending: true })
      .limit(count)

    if (!usersToActivate || usersToActivate.length === 0) {
      return { success: true, message: "No users in queue" }
    }

    // Update their status to active
    const { error } = await supabase
      .from("queue")
      .update({ status: "active" })
      .in(
        "id",
        usersToActivate.map((user) => user.id),
      )

    if (error) throw error

    return { success: true, data: usersToActivate }
  } catch (error) {
    console.error("Error activating next in queue:", error)
    return { success: false, error }
  }
}

export async function completeQueueSession(token: string) {
  try {
    const { error } = await supabase.from("queue").update({ status: "completed" }).eq("token", token)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error completing queue session:", error)
    return { success: false, error }
  }
}

export async function expireQueueSession(token: string) {
  try {
    const { error } = await supabase.from("queue").update({ status: "expired" }).eq("token", token)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error expiring queue session:", error)
    return { success: false, error }
  }
}
