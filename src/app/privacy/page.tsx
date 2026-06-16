import React from "react";
import { ShieldCheck, Calendar, Lock, Eye, Trash2, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 py-12">
      {/* Header */}
      <div className="space-y-3 border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck size={24} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          <span className="text-xs font-bold uppercase tracking-widest">Legal</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Politique de Confidentialité / Política de Privacidad
        </h1>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
          <Calendar size={12} />
          Última actualización: 16 de Junio de 2026
        </p>
      </div>

      {/* Intro */}
      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground space-y-6">
        <p>
          Esta Política de Privacidad describe cómo <strong>5estrelles-auto-ia.vercel.app</strong> (denominado "el Sitio", "nosotros", "nuestro") recopila, utiliza y protege los datos personales de los usuarios que conectan sus cuentas de Google Business Profile a través de nuestra integración de respuesta automática.
        </p>

        {/* Section 1 */}
        <div className="space-y-3 bg-muted/20 p-6 rounded-2xl border border-border/40">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Eye size={18} className="text-primary" />
            1. Datos que recopilamos (Datos de Google)
          </h2>
          <p>
            Al utilizar el flujo de autorización OAuth 2.0 de Google, nuestra aplicación solicita permiso para acceder a su cuenta de Google Business Profile (mediante el alcance <code>https://www.googleapis.com/auth/business.manage</code>). Recopilamos y almacenamos los siguientes datos únicamente para el establecimiento seleccionado:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Tokens de acceso y actualización (Refresh Tokens)</strong>: Para poder autenticarnos con la API de Google y responder en su nombre sin que tenga que volver a iniciar sesión.</li>
            <li><strong>Información del perfil de empresa</strong>: El nombre de la empresa, ID de ubicación (Location ID), y ID de cuenta para identificar correctamente el comercio.</li>
            <li><strong>Reseñas y Comentarios</strong>: El texto de las reseñas de sus clientes, el nombre y la foto del autor de la reseña, y la calificación (estrellas) para poder redactar las respuestas.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 bg-muted/20 p-6 rounded-2xl border border-border/40">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            2. Uso de los datos
          </h2>
          <p>
            Los datos recopilados se utilizan exclusivamente para los siguientes fines:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Generación de respuestas por IA</strong>: Analizar el comentario exacto del cliente y generar un borrador de respuesta adaptado a las consignas que usted ha configurado.</li>
            <li><strong>Publicación automática de respuestas</strong>: Publicar las respuestas autorizadas en Google Maps a través de la API oficial de Google Business Profile.</li>
            <li>No compartimos, vendemos, ni transferimos ninguna información a terceros externos, excepto a la API de Google para realizar la publicación y a la API de Google AI Studio (Gemini) para la redacción de la respuesta.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 bg-muted/20 p-6 rounded-2xl border border-border/40">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            3. Seguridad y Almacenamiento
          </h2>
          <p>
            Los datos se almacenan de manera segura en nuestra base de datos alojada en **Supabase** (PostgreSQL). Implementamos medidas de seguridad físicas y electrónicas de nivel industrial para garantizar que sus tokens de acceso de Google y sus datos de empresa estén protegidos contra accesos no autorizados.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3 bg-muted/20 p-6 rounded-2xl border border-border/40">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trash2 size={18} className="text-primary" />
            4. Control del usuario y Eliminación de datos
          </h2>
          <p>
            Usted tiene control total sobre sus datos:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Revocación de acceso</strong>: Puede revocar los permisos de nuestra aplicación en cualquier momento desde la configuración de su cuenta de Google en <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Google Permissions</a>.</li>
            <li><strong>Eliminación de datos</strong>: Si desconecta su cuenta o solicita la eliminación de su ficha en nuestra interfaz, todos los tokens asociados, información del comercio y avisos importados se borrarán de forma inmediata y definitiva de nuestra base de datos.</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="space-y-3 bg-muted/20 p-6 rounded-2xl border border-border/40">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            5. Contacto
          </h2>
          <p>
            Si tiene alguna pregunta sobre esta Política de Privacidad o sobre el tratamiento de sus datos de Google, puede ponerse en contacto con nosotros en :
          </p>
          <p className="font-mono text-primary font-bold">
            info@5estrelles.com
          </p>
        </div>
      </div>
    </div>
  );
}
