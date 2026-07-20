/**
 * CardSelection access via native MongoDB driver.
 * Avoids Prisma P2031 (replica set required) on standalone Mongo servers.
 */
import { MongoClient, ObjectId } from "mongodb";

let clientPromise;

function getClient() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not set");
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

function dbNameFromUri(uri) {
  try {
    const normalized = uri
      .replace(/^mongodb\+srv:/, "https:")
      .replace(/^mongodb:/, "http:");
    const u = new URL(normalized);
    const name = u.pathname.replace(/^\//, "").split("?")[0];
    return name || "yemi-bingo";
  } catch {
    return "yemi-bingo";
  }
}

async function collection() {
  const uri = process.env.DATABASE_URL;
  const client = await getClient();
  return client.db(dbNameFromUri(uri)).collection("CardSelection");
}

function toShopFilter(shopId) {
  // Prisma stores shopId as ObjectId in Mongo
  try {
    return { shopId: new ObjectId(shopId) };
  } catch {
    return { shopId };
  }
}

function serialize(doc) {
  if (!doc) return null;
  return {
    id: doc._id?.toString?.() || doc._id,
    shopId: doc.shopId?.toString?.() || doc.shopId,
    selectedCards: Array.isArray(doc.selectedCards) ? doc.selectedCards : [],
    locked: !!doc.locked,
    updatedBy: doc.updatedBy ? doc.updatedBy.toString() : null,
    updatedAt: doc.updatedAt || new Date(),
    createdAt: doc.createdAt || new Date(),
  };
}

export async function getOrCreateCardSelection(shopId) {
  const col = await collection();
  const filter = toShopFilter(shopId);
  let doc = await col.findOne(filter);

  if (!doc) {
    // also try string shopId in case import used strings
    doc = await col.findOne({ shopId });
  }

  if (!doc) {
    const now = new Date();
    let shopObjectId;
    try {
      shopObjectId = new ObjectId(shopId);
    } catch {
      shopObjectId = shopId;
    }
    const insert = {
      shopId: shopObjectId,
      selectedCards: [],
      locked: false,
      updatedBy: null,
      updatedAt: now,
      createdAt: now,
    };
    const result = await col.insertOne(insert);
    doc = { _id: result.insertedId, ...insert };
  }

  return serialize(doc);
}

export async function updateCardSelection(shopId, { selectedCards, locked, updatedBy }) {
  const col = await collection();
  const now = new Date();
  let updatedByValue = null;
  if (updatedBy) {
    try {
      updatedByValue = new ObjectId(updatedBy);
    } catch {
      updatedByValue = updatedBy;
    }
  }

  const update = {
    $set: {
      selectedCards,
      locked,
      updatedBy: updatedByValue,
      updatedAt: now,
    },
  };

  // Try ObjectId shopId first, then string
  let result = await col.findOneAndUpdate(toShopFilter(shopId), update, {
    returnDocument: "after",
  });

  if (!result) {
    result = await col.findOneAndUpdate({ shopId }, update, {
      returnDocument: "after",
    });
  }

  // Older drivers return { value: doc }
  const doc = result?.value ?? result;
  if (!doc || !doc._id) {
    // create then update
    await getOrCreateCardSelection(shopId);
    const again = await col.findOneAndUpdate(toShopFilter(shopId), update, {
      returnDocument: "after",
    });
    return serialize(again?.value ?? again);
  }

  return serialize(doc);
}
