import { getEmailSettings } from "@/app/(admin)/admin/settings/_actions/settings-actions";
import { decryptPassword } from "@/lib/helpers";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Typ für die Formulardaten
interface ContactFormData {
	name: string;
	email: string;
	message: string;
}

export async function POST(req: NextRequest) {

    const emailSettings = await getEmailSettings();

    const decryptedPassword = decryptPassword(emailSettings?.emailPass || "")

	try {
		const { name, email, message }: ContactFormData = await req.json();

		// Konfiguriere den SMTP-Transporter
		const transporter = nodemailer.createTransport({
			host: emailSettings?.emailHostSmtp, //process.env.EMAIL_HOST, // z. B. "smtp.eurodns.com"
			port: Number(emailSettings?.emailPortSmtp), // Number(process.env.EMAIL_PORT), // z. B. 587 oder 465
			secure: emailSettings?.isEmailSecureSmtp, //process.env.EMAIL_SECURE === "true", // true = SSL, false = TLS
			auth: {
				user: emailSettings?.emailUser, // process.env.EMAIL_USER,
				pass: decryptedPassword, // process.env.EMAIL_PASS,
			},
		});

		// E-Mail-Optionen
		const mailOptions = {
			from: `"${name} via Contact Form" <${emailSettings?.emailUser}>`,
			to: emailSettings?.emailUser, // Empfänger ist deine Gmail/EuroDNS-E-Mail
			subject: `Contact Form: Message from ${name}`,
			text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
		};

		// Sende die E-Mail
		await transporter.sendMail(mailOptions);

		return NextResponse.json(
			{ message: "Email sent successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Error sending the email" },
			{ status: 500 }
		);
	}
}
