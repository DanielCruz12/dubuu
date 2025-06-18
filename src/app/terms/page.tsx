export const metadata = {
  title: "Términos y Condiciones",
  description:
    "Estos Términos y Condiciones rigen el uso de Dubuu, incluyendo servicios, registro, seguridad, procesamiento de pagos y más.",
};

export default function TermsAndConditionsPage() {
  const terms = [
    {
      title: "1. Introducción",
      content:
        "Bienvenido a Dubuu. Estos Términos y Condiciones rigen el uso de nuestra plataforma, incluyendo todos los servicios y funcionalidades asociadas. Al acceder o utilizar Dubuu, usted acepta estar sujeto a estos términos. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder o utilizar nuestros servicios.",
    },
    {
      title: "2. Definiciones",
      content:
        "Para efectos de estos Términos y Condiciones, se entenderá por: 'Servicio': Todas las funcionalidades, herramientas y contenidos ofrecidos a través de la plataforma Dubuu. 'Usuario': Toda persona que se registre, acceda o utilice el Servicio. 'Cuenta': El registro personal que permite al Usuario acceder a funcionalidades específicas del Servicio. 'Contenido del Usuario': Toda información, datos, textos, fotografías, gráficos, mensajes u otros materiales que los Usuarios envían, publican o muestran en el Servicio. 'Datos Personales': Cualquier información relativa a una persona física identificada o identificable.",
    },
    {
      title: "3. Registro y Seguridad de la Cuenta",
      content:
        "Para utilizar ciertas funcionalidades de nuestra plataforma, es posible que deba registrarse y crear una cuenta. Utilizamos Clerk para la autenticación de usuarios, lo que proporciona un nivel adicional de seguridad. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Implementamos medidas de seguridad como el cifrado de datos y certificados SSL para proteger su información.",
    },
    {
      title: "4. Phishing y Seguridad",
      content:
        "El phishing es una práctica fraudulenta donde los estafadores intentan obtener información sensible haciéndose pasar por entidades confiables. Dubuu nunca le solicitará información sensible a través de correos electrónicos no solicitados o mensajes. A pesar de nuestros esfuerzos para mantener la plataforma segura, no nos hacemos responsables por actividades de phishing o robo de datos realizadas por terceros que puedan suplantar nuestra identidad.",
    },
    {
      title: "5. Procesamiento de Pagos",
      content: (
        <span>
          Utilizamos Wompi como nuestro procesador de pagos. Al realizar una
          transacción en nuestra plataforma, usted también está sujeto a los
          términos y condiciones y políticas de privacidad de Wompi (
          <a
            href="https://wompi.sv/TerminosCondiciones/Usuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            https://wompi.sv/TerminosCondiciones/Usuario
          </a>
          ). Wompi implementa seguridad 3D para proteger las transacciones. No
          almacenamos datos de tarjetas de crédito en nuestros servidores, ya
          que todo el procesamiento de pagos es manejado directamente por Wompi.
        </span>
      ),
    },
    {
      title: "6. Limitación de Responsabilidad",
      content:
        "En la máxima medida permitida por la ley aplicable, Dubuu no será responsable por daños directos, indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pero no limitado a, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes del uso o la imposibilidad de usar la plataforma.",
    },
    {
      title: "7. Propiedad Intelectual y Prohibición de Copia",
      content:
        "Todo el contenido, características y funcionalidad de la plataforma Dubuu son propiedad de Dubuu o de sus licenciantes y están protegidos por leyes de propiedad intelectual. Queda estrictamente prohibida la copia, reproducción, modificación, distribución o cualquier uso no autorizado. La infracción de estos derechos será perseguida legalmente y podrá resultar en acciones judiciales, incluyendo demandas por daños y perjuicios, multas y otras sanciones según lo establecido por la ley.",
    },
    {
      title: "8. Servicios de Terceros",
      content: (
        <span>
          Nuestra plataforma utiliza varios servicios de terceros para mejorar
          la experiencia del usuario y la seguridad:{" "}
          <a
            href="https://www.cloudflare.com/es-es/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Cloudflare
          </a>{" "}
          para la protección y optimización del sitio web,{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google reCAPTCHA
          </a>{" "}
          para prevenir actividades automatizadas maliciosas,{" "}
          <a
            href="https://clerk.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Clerk
          </a>{" "}
          para autenticación de usuarios, y{" "}
          <a
            href="https://wompi.sv/TerminosCondiciones/Usuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Wompi
          </a>{" "}
          para procesamiento de pagos. El uso de estos servicios está sujeto a
          sus respectivos términos y condiciones y políticas de privacidad.
        </span>
      ),
    },
    {
      title: "9. Modificaciones a los Términos",
      content:
        "Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma. Su uso continuado de la plataforma después de la publicación de los cambios constituirá su aceptación de dichos cambios.",
    },
    {
      title: "10. Ley Aplicable",
      content:
        "Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes del país donde Dubuu tiene su sede principal, sin tener en cuenta sus disposiciones sobre conflictos de leyes. Cualquier disputa que surja en relación con estos Términos y Condiciones estará sujeta a la jurisdicción exclusiva de los tribunales de dicho país.",
    },
  ];

  return (
    <div className="px-5 md:px-20">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">
        Términos y Condiciones
      </h2>
      <div className="prose prose-sm">
        {terms.map((term, index) => (
          <div className="py-1" key={index}>
            <h2 className="text-sm md:text-base font-medium mb-1">
              {term.title}
            </h2>
            <div className="pb-3 text-sm ">{term.content}</div>
          </div>
        ))}
        <div className="py-1">
          <p className="text-sm mt-4">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>
    </div>
  );
}
