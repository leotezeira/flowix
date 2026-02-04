import { NextRequest, NextResponse } from 'next/server';

// Para el email, usaremos Resend (gratuito) o un servicio similar
// Por ahora, vamos a crear un endpoint que puede ser usado
// En producción, necesitarías instalar resend: npm install resend

export async function POST(request: NextRequest) {
    try {
        const { type, email, storeName } = await request.json();

        if (!email || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Aquí iría la lógica de envío de emails
        // Opciones gratuitas: Resend, SendGrid free tier, Mailgun, etc.
        
        if (type === 'store_deactivated') {
            // Enviar email de desactivación
            console.log(`Enviando email de desactivación a ${email} para tienda: ${storeName}`);
            // await sendEmail({ to: email, subject: '... });
        } else if (type === 'store_reactivated') {
            // Enviar email de reactivación
            console.log(`Enviando email de reactivación a ${email} para tienda: ${storeName}`);
        }

        return NextResponse.json({ 
            success: true,
            message: 'Email sent (en desarrollo)'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
