export default function Footer() {
  return (
    <footer className="py-16 bg-black text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-bold mb-6">DANTOUR</h3>
            <p className="text-gray-400 mb-6">
              Experiencias de viaje exclusivas diseñadas para los viajeros más
              exigentes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold mb-6">DESTINOS</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Europa
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Asia
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    América
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-6">EXPERIENCIAS</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Tours Privados
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Villas Exclusivas
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Yates & Cruceros
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Dantour&lsquo;s. Todos los derechos reservados.
          </p>
          <div className="mt-4 md:mt-0 flex gap-6">
            <a
              href="#"
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Términos
            </a>
            <a
              href="#"
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
