import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo recopilamos, utilizamos y protegemos tu información personal en Dubuu. Nuestra política de privacidad explica nuestras prácticas de datos y tus derechos.",
};

export default function PrivacyPolicyPage() {
  const privacyPolicies = [
    {
      title: "1. Información que Recopilamos",
      content:
        "Podemos recopilar los siguientes tipos de información: Información de registro cuando crea una cuenta a través de Clerk, información de perfil que usted proporciona, información de uso sobre cómo interactúa con nuestra plataforma, e información del dispositivo que utiliza para acceder a nuestra plataforma.",
    },
    {
      title: "2. Cómo Utilizamos su Información",
      content:
        "Utilizamos la información recopilada para: Proporcionar, mantener y mejorar nuestra plataforma, procesar transacciones y enviar notificaciones relacionadas, personalizar su experiencia, comunicarnos con usted, proteger la seguridad e integridad de nuestra plataforma, y cumplir con obligaciones legales.",
    },
    {
      title: "3. Seguridad de los Datos",
      content:
        "Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para proteger la información que recopilamos. Estas medidas incluyen: Encriptación de datos sensibles, uso de certificados SSL para todas las transmisiones de datos, autenticación segura a través de Clerk, y monitoreo regular de nuestros sistemas. Sin embargo, ningún sistema de seguridad es impenetrable.",
    },
    {
      title: "4. Procesamiento de Pagos",
      content: (
        <span>
          Utilizamos Wompi como nuestro procesador de pagos. Cuando realiza una
          transacción en nuestra plataforma, no almacenamos datos de tarjetas de
          crédito en nuestros servidores. Toda la información de pago es
          procesada directamente por Wompi, que implementa seguridad 3D y otras
          medidas de protección. Para más información, consulte su política de
          privacidad en{" "}
          <a
            href="https://wompi.sv/TerminosCondiciones/Usuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            https://wompi.sv/TerminosCondiciones/Usuario
          </a>
          .
        </span>
      ),
    },
    {
      title: "5. Servicios de Terceros",
      content: (
        <span>
          Nuestra plataforma utiliza varios servicios de terceros:{" "}
          <a
            href="https://clerk.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Clerk
          </a>{" "}
          para autenticación de usuarios,{" "}
          <a
            href="https://www.cloudflare.com/es-es/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Cloudflare
          </a>{" "}
          para protección y optimización del sitio web,{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google reCAPTCHA
          </a>{" "}
          para prevenir actividades automatizadas maliciosas, y{" "}
          <a
            href="https://wompi.sv/TerminosCondiciones/Usuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Wompi
          </a>{" "}
          para procesamiento de pagos. Estos servicios tienen sus propias
          políticas de privacidad que rigen cómo manejan su información.
        </span>
      ),
    },
    {
      title: "6. Cookies y Tecnologías Similares",
      content:
        "No utilizamos cookies para rastrear a los usuarios. Sin embargo, algunos de nuestros proveedores de servicios de terceros pueden utilizar cookies y tecnologías similares para proporcionar sus servicios. Usted puede configurar su navegador para rechazar todas las cookies, pero esto puede afectar la funcionalidad de algunos servicios.",
    },
    {
      title: "7. Sus Derechos",
      content:
        "Dependiendo de su ubicación, puede tener ciertos derechos con respecto a su información personal, incluyendo: Acceder a la información personal que tenemos sobre usted, corregir información inexacta, solicitar la eliminación de su información personal, oponerse al procesamiento de su información, solicitar la portabilidad de sus datos, y retirar su consentimiento en cualquier momento.",
    },
    {
      title: "8. Transferencias Internacionales de Datos",
      content:
        "Su información puede ser transferida y procesada en países distintos al suyo, donde nuestros servidores o los de nuestros proveedores de servicios están ubicados. Estos países pueden tener leyes de protección de datos diferentes a las de su país. Al utilizar nuestra plataforma, usted consiente a estas transferencias.",
    },
    {
      title: "9. Cambios a esta Política de Privacidad",
      content:
        "Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por otras razones operativas, legales o regulatorias. Le notificaremos sobre cualquier cambio material publicando la nueva Política de Privacidad en esta página y, si es necesario, a través de un aviso en nuestra plataforma.",
    },
    {
      title: "10. Contacto",
      content:
        "Si tiene alguna pregunta o inquietud sobre esta Política de Privacidad o nuestras prácticas de privacidad, por favor contáctenos a través de los canales de comunicación proporcionados en nuestra plataforma.",
    },
  ];

  return (
    <div className="px-5 md:px-20">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">
        Política de Privacidad
      </h2>
      <div className="prose prose-sm">
        <p className="text-sm pb-3">
          En Dubuu, valoramos y respetamos su privacidad. Esta Política de
          Privacidad explica cómo recopilamos, utilizamos, divulgamos y
          protegemos su información cuando utiliza nuestra plataforma.
        </p>
        {privacyPolicies.map((policy, index) => (
          <div className="py-1" key={index}>
            <h2 className="text-sm md:text-base font-medium mb-1">
              {policy.title}
            </h2>
            <div className="pb-3 text-sm ">{policy.content}</div>
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
