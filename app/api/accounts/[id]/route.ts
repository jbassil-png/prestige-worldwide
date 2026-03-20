import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = params.id;

    // Verify the account belongs to this user
    const { data: account } = await supabase
      .from("user_accounts")
      .select("id, plaid_item_id")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Delete the account (hard delete as requested)
    const { error: deleteError } = await supabase
      .from("user_accounts")
      .delete()
      .eq("id", accountId);

    if (deleteError) {
      console.error("Error deleting account:", deleteError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    // Check if there are any other accounts using the same plaid_item
    if (account.plaid_item_id) {
      const { count } = await supabase
        .from("user_accounts")
        .select("*", { count: "exact", head: true })
        .eq("plaid_item_id", account.plaid_item_id);

      // If no other accounts use this plaid item, delete it too
      if (count === 0) {
        await supabase
          .from("plaid_items")
          .delete()
          .eq("id", account.plaid_item_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
