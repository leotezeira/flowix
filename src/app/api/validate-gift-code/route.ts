import { NextRequest, NextResponse } from 'next/server';

// Código secreto - En producción, este debería estar en variables de entorno o en un archivo seguro
const GIFT_CODE = 'FLOWIX-PREMIUM-2026-ULTRA-7K9P2X4M';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json(
                { error: 'Código inválido' },
                { status: 400 }
            );
        }

        // Validar el código (case-insensitive y sin espacios)
        const normalizedCode = code.trim().toUpperCase();
        const normalizedGiftCode = GIFT_CODE.trim().toUpperCase();

        if (normalizedCode === normalizedGiftCode) {
            return NextResponse.json({
                valid: true,
                message: 'Código válido.'
            });
        }

        return NextResponse.json(
            { valid: false, error: 'Código incorrecto' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Error validating gift code:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
