import { json, ActionFunctionArgs } from "@remix-run/node";
import { verifyEmailToken } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json(
      { success: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const type = (formData.get("type") as string) || "email";

    if (!token) {
      return json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify the token
    const result = await verifyEmailToken(token, type);

    if (!result.success) {
      return json({ success: false, error: result.error }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error verifying email:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
