import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { InventoryItem, StockMovement } from "@/lib/gst-types";

function itemsKey(uid: string) { return `gst_inventory:${uid}`; }
function movKey(uid: string) { return `gst_stock_moves:${uid}`; }

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const uid = session.role === "admin" && searchParams.get("userId") ? searchParams.get("userId")! : session.id;

  const items: InventoryItem[] = (await kv.get(itemsKey(uid))) || [];
  const moves: StockMovement[] = (await kv.get(movKey(uid))) || [];

  const lowStock = items.filter((i) => i.currentStock <= i.lowStockAlert);

  return Response.json({ data: { items, moves, lowStock } });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, userId: bodyUserId } = body;
  const uid = session.role === "admin" && bodyUserId ? bodyUserId : session.id;

  if (action === "upsert_item") {
    const items: InventoryItem[] = (await kv.get(itemsKey(uid))) || [];
    const { item } = body;
    const idx = items.findIndex((i) => i.id === item.id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...item, lastUpdated: now };
    } else {
      items.push({ ...item, userId: uid, lastUpdated: now });
    }
    await kv.set(itemsKey(uid), items);
    return Response.json({ success: true });
  }

  if (action === "delete_item") {
    const items: InventoryItem[] = (await kv.get(itemsKey(uid))) || [];
    await kv.set(itemsKey(uid), items.filter((i) => i.id !== body.id));
    return Response.json({ success: true });
  }

  if (action === "stock_move") {
    const { itemId, type, qty, note, invoiceId } = body;
    const items: InventoryItem[] = (await kv.get(itemsKey(uid))) || [];
    const moves: StockMovement[] = (await kv.get(movKey(uid))) || [];
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx < 0) return Response.json({ error: "Item not found" }, { status: 404 });

    items[idx].currentStock += type === "in" ? qty : -qty;
    items[idx].lastUpdated = new Date().toISOString();

    moves.push({
      id: crypto.randomUUID(),
      userId: uid,
      itemId,
      type,
      qty,
      invoiceId: invoiceId || undefined,
      note: note || "",
      date: new Date().toISOString(),
    });

    await kv.set(itemsKey(uid), items);
    await kv.set(movKey(uid), moves);
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
