import { NextResponse } from "next/server";
import { authService } from "@/lib/services";
import { loginSchema } from "@/lib/validators";
import { buildAuthCookie } from "@/lib/auth-server";

function extractToken(data: any) {
  return data?.token ?? data?.access_token ?? data?.data?.token ?? data?.data?.access_token;
}

export async function POST(request: Request) {
  const body = await request.json();
  const parseResult = loginSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.flatten().formErrors.join(" ") }, { status: 400 });
  }

  try {
    const response = await authService.login(parseResult.data);
    const token = extractToken(response);

    if (!token) {
      return NextResponse.json({ message: "Authentication token was not returned." }, { status: 500 });
    }

    const nextResponse = NextResponse.json({ message: "Login successful", token });
    const cookieConfig = buildAuthCookie(token);
    nextResponse.cookies.set(cookieConfig.name, cookieConfig.value, cookieConfig.options);

    return nextResponse;
  } catch (error: any) {
    const message = error?.message ?? "Login failed";
    return NextResponse.json({ message }, { status: 422 });
  }
}
