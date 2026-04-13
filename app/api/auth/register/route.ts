import { NextResponse } from "next/server";
import { authService } from "@/lib/services";
import { registerSchema } from "@/lib/validators";
import { buildAuthCookie } from "@/lib/auth-server";

function extractToken(data: any) {
  return data?.token ?? data?.access_token ?? data?.data?.token ?? data?.data?.access_token;
}

export async function POST(request: Request) {
  const body = await request.json();
  const parseResult = registerSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.flatten().formErrors.join(" ") }, { status: 400 });
  }

  try {
    const response = await authService.register({
      name: parseResult.data.name,
      email: parseResult.data.email,
      password: parseResult.data.password,
      password_confirmation: parseResult.data.passwordConfirmation,
    });

    const token = extractToken(response);
    const nextResponse = NextResponse.json({ message: "Registration successful", token: token || null });

    if (token) {
      const cookieConfig = buildAuthCookie(token);
      nextResponse.cookies.set(cookieConfig.name, cookieConfig.value, cookieConfig.options);
    }

    return nextResponse;
  } catch (error: any) {
    const message = error?.message ?? "Registration failed";
    return NextResponse.json({ message }, { status: 422 });
  }
}
