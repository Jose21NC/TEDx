import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface SponsorBody {
    companyName: string;
    contactName: string;
    email: string;
    message: string;
}

export async function POST(request: NextRequest) {
    try {
        const { companyName, contactName, email, message }: SponsorBody = await request.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDER_MAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        // 1. Notificación para TI (Organizador TEDx)
        const adminMail = {
            from: process.env.SENDER_MAIL,
            to: process.env.SENDER_MAIL, // Te llega a ti mismo
            subject: `🚀 Nueva Propuesta de Patrocinio: ${companyName}`,
            text: `Empresa: ${companyName}\nContacto: ${contactName}\nEmail: ${email}\n\nPropuesta:\n${message}`,
        };

        // 2. Confirmación para el PATROCINADOR
        const sponsorMail = {
            from: `Equipo TEDx <${process.env.SENDER_MAIL}>`,
            to: email,
            subject: `Confirmación de postulación - TEDx Patrocinios`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #eb0028;">¡Gracias por tu interés en TEDx!</h2>
                    <p>Hola <strong>${contactName}</strong>,</p>
                    <p>Hemos recibido la propuesta de <strong>${companyName}</strong> para formar parte de nuestro próximo evento.</p>
                    <p>Nuestro equipo de alianzas revisará la información y se pondrá en contacto contigo a la brevedad.</p>
                    <hr />
                    <p style="font-size: 0.8em; color: #555;">Este es un mensaje automático del sistema de postulaciones TEDx.</p>
                </div>
            `,
        };

        // Enviamos ambos correos
        await Promise.all([
            transporter.sendMail(adminMail),
            transporter.sendMail(sponsorMail)
        ]);

        return NextResponse.json({ message: "Postulación enviada" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
