import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getNewStoreEmailTemplate, getAdminNotificationEmailTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { type, email, storeName, storeUrl, ownerName, adminEmail } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Email de bienvenida al propietario de la tienda
    if (type === 'store_created') {
      if (!storeName || !storeUrl) {
        return NextResponse.json(
          { error: 'Missing storeName or storeUrl for store_created type' },
          { status: 400 }
        );
      }

      const html = getNewStoreEmailTemplate(storeName, email, storeUrl);
      const result = await sendEmail({
        to: email,
        subject: `¡Tu tienda "${storeName}" ha sido creada en Flowix!`,
        html,
      });

      if (!result.success) {
        console.error('Failed to send welcome email:', result.error);
        return NextResponse.json(
          { error: 'Failed to send welcome email', details: result.error },
          { status: 500 }
        );
      }

      // También enviar notificación al admin si se proporciona
      if (adminEmail) {
        const adminHtml = getAdminNotificationEmailTemplate(storeName, email, ownerName);
        await sendEmail({
          to: adminEmail,
          subject: `[NOTIFICACIÓN] Nueva tienda creada: ${storeName}`,
          html: adminHtml,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
