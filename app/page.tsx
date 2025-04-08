import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  // This would normally be fetched from Supabase
  const featuredEvents = [
    {
      id: "1",
      name: "Romeo y Julieta",
      date: "2023-12-15",
      time: "19:00",
      image_url: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "2",
      name: "El Fantasma de la Ópera",
      date: "2023-12-20",
      time: "20:00",
      image_url: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "3",
      name: "Hamlet",
      date: "2023-12-25",
      time: "18:30",
      image_url: "/placeholder.svg?height=400&width=600",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-purple-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Teatro Mora Virtual</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Disfruta de los mejores eventos teatrales con nuestro sistema de cola virtual y foros interactivos.
          </p>
          <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
            <Link href="/eventos">Ver Eventos</Link>
          </Button>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">Próximos Eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden transition-all hover:shadow-lg">
                <img
                  src={event.image_url || "/placeholder.svg"}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {new Date(event.date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    - {event.time}
                  </p>
                  <Button asChild className="w-full">
                    <Link href={`/eventos/${event.id}`}>Ver Detalles</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link href="/eventos">Ver Todos los Eventos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">¿Por qué Teatro Mora Virtual?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="bg-purple-100 text-purple-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Cola Virtual</h3>
              <p className="text-gray-600">
                Olvídate de las largas esperas y los colapsos del sistema. Nuestra cola virtual te asegura un proceso de
                compra justo y ordenado.
              </p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="bg-purple-100 text-purple-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Foros Interactivos</h3>
              <p className="text-gray-600">
                Conecta con los actores y otros asistentes a través de nuestros foros interactivos. Pregunta, comenta y
                comparte tu experiencia.
              </p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="bg-purple-100 text-purple-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Selección de Asientos</h3>
              <p className="text-gray-600">
                Elige tus asientos preferidos de manera fácil e intuitiva con nuestro sistema de selección visual.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
