import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Teatro Mora</h3>
            <p className="text-gray-300">Experiencias teatrales inolvidables en un espacio íntimo y acogedor.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="text-gray-300 hover:text-white transition">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/actores" className="text-gray-300 hover:text-white transition">
                  Actores
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white transition">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <address className="not-italic text-gray-300">
              <p>Calle Principal #123</p>
              <p>Ciudad, CP 12345</p>
              <p className="mt-2">Email: info@teatromora.com</p>
              <p>Teléfono: (123) 456-7890</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Teatro Mora. Todos los derechos reservados.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition">
              Términos de servicio
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Política de privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
