import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getNewStoreEmailTemplate(
  storeName: string,
  ownerEmail: string,
  storeUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .highlight {
            background-color: #f0f4ff;
            padding: 15px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Tu tienda ha sido creada! 🎉</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>¡Felicidades! Tu tienda <strong>"${storeName}"</strong> ha sido creada exitosamente en Flowix.</p>
            
            <div class="highlight">
              <p><strong>📊 Detalles de tu tienda:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Nombre:</strong> ${storeName}</li>
                <li><strong>Email del propietario:</strong> ${ownerEmail}</li>
                <li><strong>Período de prueba:</strong> 7 días gratis</li>
              </ul>
            </div>

            <p><strong>Próximos pasos:</strong></p>
            <ol>
              <li>Completa tu perfil y sube tu logo</li>
              <li>Crea tus categorías de productos</li>
              <li>Agrega tus productos con precios y fotos</li>
              <li>Comparte tu link con tus clientes</li>
              <li>¡Comienza a recibir pedidos por WhatsApp!</li>
            </ol>

            <center>
              <a href="${storeUrl}" class="button">Acceder a tu tienda →</a>
            </center>

            <div class="highlight">
              <p><strong>💡 Recuerda:</strong> Tienes 7 días gratis para probar todas las funcionalidades. Después, necesitarás activar una suscripción para continuar.</p>
            </div>

            <p>Si tienes alguna duda, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
            <p>Saludos,<br><strong>El equipo de Flowix</strong></p>
          </div>
          <div class="footer">
            <p>© 2026 Flowix. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getAdminNotificationEmailTemplate(
  storeName: string,
  ownerEmail: string,
  ownerName?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .alert {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .info-box {
            background-color: #e0f2fe;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>✅ Nueva tienda creada</h2>
          
          <div class="info-box">
            <p><strong>Tienda:</strong> ${storeName}</p>
            <p><strong>Propietario:</strong> ${ownerName || 'N/A'}</p>
            <p><strong>Email:</strong> ${ownerEmail}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString('es-AR')}</p>
          </div>

          <p>Una nueva tienda ha sido registrada en tu plataforma Flowix.</p>
        </div>
      </body>
    </html>
  `;
}
