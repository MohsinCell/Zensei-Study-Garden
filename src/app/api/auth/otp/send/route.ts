import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

export async function POST(req: NextRequest) {
  try {
    const { email, type, name, password } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (type === "signup") {
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
    }

    if (type === "signin") {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "No account found with this email" },
          { status: 404 }
        );
      }

      // 2FA: verify password before sending OTP
      if (!password) {
        return NextResponse.json(
          { error: "Password is required" },
          { status: 400 }
        );
      }

      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "Please reset your password first" },
          { status: 400 }
        );
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    if (type === "forgot-password" || type === "delete-account") {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "No account found with this email" },
          { status: 404 }
        );
      }

      if (type === "delete-account") {
        if (!password) {
          return NextResponse.json(
            { error: "Password is required" },
            { status: 400 }
          );
        }

        if (!user.passwordHash) {
          return NextResponse.json(
            { error: "Please reset your password first" },
            { status: 400 }
          );
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          return NextResponse.json(
            { error: "Invalid password" },
            { status: 401 }
          );
        }
      }
    }

    await prisma.verificationCode.deleteMany({
      where: {
        email: normalizedEmail,
        type,
      },
    });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        code,
        type,
        expiresAt,
      },
    });

    const userName = name || "User";

    const emailConfig: Record<string, { subject: string; from: string; heading: string; message: string; tagline: string }> = {
      signup: {
        subject: "Verify your Zensei account",
        from: "Zensei <welcome@zensei.study>",
        heading: "Verify Your Email",
        message: `Hey ${userName}, welcome to the garden! Enter the code below to verify your email and start your learning quest.`,
        tagline: "Your journey begins now",
      },
      signin: {
        subject: "Your Zensei sign-in code",
        from: "Zensei <auth@zensei.study>",
        heading: "Your Sign-In Code",
        message: "Use the code below to sign in and continue your learning streak.",
        tagline: "Welcome back, learner",
      },
      "forgot-password": {
        subject: "Reset your Zensei password",
        from: "Zensei <security@zensei.study>",
        heading: "Reset Your Password",
        message: "We received a request to reset your password. Use the code below to create a new one and get back to growing.",
        tagline: "Let's get you back in",
      },
      "delete-account": {
        subject: "Confirm account deletion",
        from: "Zensei <security@zensei.study>",
        heading: "Confirm Deletion",
        message: "You requested to permanently delete your account. Enter this code to confirm. This action cannot be undone.",
        tagline: "Are you sure?",
      },
    };

    const config = emailConfig[type] || emailConfig.signin;
    const { subject, from: fromAddress, heading, message: emailMessage, tagline } = config;

    const resend = getResendClient();

    await resend.emails.send({
      from: fromAddress,
      to: normalizedEmail,
      subject,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,Helvetica,sans-serif!important}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0f0e0c;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0e0c;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:440px;background-color:#1a1815;border-radius:16px;overflow:hidden;border:1px solid #332e28;">

          <!-- Top accent line -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent 0%,#8bab7a 30%,#d4b57d 70%,transparent 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Corner brackets + Logo section -->
          <tr>
            <td align="center" style="padding:40px 32px 24px;background:linear-gradient(180deg,rgba(139,171,122,0.06) 0%,transparent 100%);">
              <!-- HUD corner brackets (top) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td width="12" style="border-left:2px solid rgba(139,171,122,0.3);border-top:2px solid rgba(139,171,122,0.3);height:12px;font-size:0;" valign="top">&nbsp;</td>
                  <td>&nbsp;</td>
                  <td width="12" style="border-right:2px solid rgba(139,171,122,0.3);border-top:2px solid rgba(139,171,122,0.3);height:12px;font-size:0;" valign="top">&nbsp;</td>
                </tr>
              </table>

              <!-- Logo icon -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="width:56px;height:56px;background:linear-gradient(135deg,rgba(139,171,122,0.2) 0%,rgba(139,171,122,0.05) 100%);border:1px solid rgba(139,171,122,0.3);border-radius:14px;">
                    <span style="font-size:28px;line-height:56px;">&#127793;</span>
                  </td>
                </tr>
              </table>

              <!-- Brand name -->
              <p style="margin:16px 0 0;font-size:22px;font-weight:800;color:#ece5db;letter-spacing:-0.5px;text-align:center;">zensei</p>
              <p style="margin:4px 0 0;font-size:10px;font-weight:400;color:#554f46;letter-spacing:3px;text-transform:uppercase;text-align:center;">STUDY GARDEN</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,#332e28 30%,#332e28 70%,transparent);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td align="center" style="padding:32px 32px 8px;">
              <!-- Tagline badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:rgba(139,171,122,0.1);border:1px solid rgba(139,171,122,0.2);border-radius:20px;padding:6px 16px;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#8bab7a;letter-spacing:1px;text-transform:uppercase;text-align:center;">${tagline}</p>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="margin:20px 0 0;font-size:24px;font-weight:700;color:#ece5db;letter-spacing:-0.3px;line-height:1.3;text-align:center;">${heading}</h1>

              <!-- Message -->
              <p style="margin:12px 0 0;font-size:15px;font-weight:400;color:#c8bba9;line-height:1.6;text-align:center;">${emailMessage}</p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding:28px 32px;">
              <!-- Code container -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:#0f0e0c;border:1px solid #332e28;border-radius:12px;overflow:hidden;">
                <!-- Scanline overlay effect via top line -->
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,rgba(139,171,122,0.15),transparent);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 12px 4px;">
                    <p style="margin:0;font-size:10px;font-weight:600;color:#554f46;letter-spacing:3px;text-transform:uppercase;text-align:center;">VERIFICATION CODE</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:12px 20px 24px;">
                    <p style="margin:0;font-size:28px;font-weight:700;color:#8bab7a;font-family:'Courier New',Courier,monospace;letter-spacing:6px;text-align:center;">${code}</p>
                  </td>
                </tr>
                <!-- Bottom glow line -->
                <tr>
                  <td style="height:2px;background:linear-gradient(90deg,transparent,#8bab7a,#d4b57d,transparent);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Timer notice -->
          <tr>
            <td align="center" style="padding:0 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background:rgba(212,181,125,0.08);border:1px solid rgba(212,181,125,0.15);border-radius:8px;padding:12px 20px;">
                    <p style="margin:0;font-size:13px;color:#d4b57d;text-align:center;">&#9201; This code expires in <strong>2 minutes</strong></p>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:13px;color:#8a7f72;text-align:center;">If you didn't request this code, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,#332e28 30%,#332e28 70%,transparent);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 32px;background:#16140f;">
              <!-- HUD corner brackets (bottom) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                <tr>
                  <td width="12" style="border-left:2px solid rgba(139,171,122,0.15);border-bottom:2px solid rgba(139,171,122,0.15);height:12px;font-size:0;" valign="bottom">&nbsp;</td>
                  <td>&nbsp;</td>
                  <td width="12" style="border-right:2px solid rgba(139,171,122,0.15);border-bottom:2px solid rgba(139,171,122,0.15);height:12px;font-size:0;" valign="bottom">&nbsp;</td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#554f46;text-align:center;">&copy; ${new Date().getFullYear()} Zensei &middot; Study Garden</p>
              <p style="margin:6px 0 0;font-size:11px;color:#3d3830;text-align:center;">Grow your knowledge, one topic at a time.</p>
            </td>
          </tr>

          <!-- Bottom accent line -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent 0%,#8bab7a 30%,#d4b57d 70%,transparent 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
