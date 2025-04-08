"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUser } from "@/lib/auth"
import { getEventForumPosts, createForumPost, type ForumPostWithUser } from "@/lib/data-service"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EventForumProps {
  eventId: string
}

export function EventForum({ eventId }: EventForumProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<ForumPostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getUser()
      setIsLoggedIn(!!currentUser)
      setUser(currentUser)
    }

    const fetchPosts = async () => {
      try {
        setLoading(true)
        const forumPosts = await getEventForumPosts(eventId)
        setPosts(forumPosts)
      } catch (err) {
        console.error("Error fetching forum posts:", err)
        setError("No se pudieron cargar los mensajes del foro")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
    fetchPosts()
  }, [eventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const postData = {
        event_id: eventId,
        user_id: user.id,
        content: message,
        parent_id: replyTo,
      }

      await createForumPost(postData)

      // Refresh posts
      const forumPosts = await getEventForumPosts(eventId)
      setPosts(forumPosts)

      // Reset form
      setMessage("")
      setReplyTo(null)
    } catch (err: any) {
      setError(err.message || "Error al enviar el mensaje")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = (postId: string) => {
    setReplyTo(postId)
    // Scroll to form
    document.getElementById("forum-form")?.scrollIntoView({ behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto"></div>
        <p className="mt-4">Cargando mensajes del foro...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Foro del Evento</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg mb-8">
          <p className="text-gray-500">No hay mensajes en el foro. ¡Sé el primero en comentar!</p>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.user?.avatar_url || ""} alt={post.user?.name || "Usuario"} />
                  <AvatarFallback>{(post.user?.name || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{post.user?.name || "Usuario"}</span>
                    {post.user?.role === "actor" && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">Actor</span>
                    )}
                    <span className="text-gray-500 text-sm">
                      {new Date(post.created_at).toLocaleString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700">{post.content}</p>
                  {isLoggedIn && (
                    <button
                      onClick={() => handleReply(post.id)}
                      className="text-sm text-purple-600 mt-2 hover:underline"
                    >
                      Responder
                    </button>
                  )}
                </div>
              </div>

              {/* Replies */}
              {post.replies && post.replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-4">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-4 border-l-2 border-gray-200 pl-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.user?.avatar_url || ""} alt={reply.user?.name || "Usuario"} />
                        <AvatarFallback>{(reply.user?.name || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{reply.user?.name || "Usuario"}</span>
                          {reply.user?.role === "actor" && (
                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">Actor</span>
                          )}
                          <span className="text-gray-500 text-sm">
                            {new Date(reply.created_at).toLocaleString("es-ES", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <form id="forum-form" onSubmit={handleSubmit} className="space-y-4">
          {replyTo && (
            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-sm">Respondiendo a un mensaje</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          )}
          <Textarea
            placeholder="Escribe tu mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            required
          />
          <Button type="submit" disabled={isSubmitting || !message.trim()}>
            {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
          </Button>
        </form>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p className="text-gray-700 mb-2">Debes iniciar sesión para participar en el foro.</p>
          <Button asChild>
            <a href="/auth">Iniciar Sesión</a>
          </Button>
        </div>
      )}
    </div>
  )
}
