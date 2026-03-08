import OAuthUser from "@/models/OAuthUser";
import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

interface Cached {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongooseCache: Cached | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export default async function connectDB() {
        console.log(cached!.promise);
    if (cached!.conn) return cached!.conn;

    if (!cached!.promise) {
        cached!.promise = mongoose.connect(MONGODB_URI);
    }


    cached!.conn = await cached!.promise;
    return cached!.conn;
}

export async function ensureDBEntry(email: string) {
    console.log("ensuring db entry for:", email);
    try {
        await connectDB();
        const userdata = await OAuthUser.find({ email });

        if (userdata.length === 0) {
            try {
                const user = await OAuthUser.create({ email });
                console.log("user created:", user);
            } catch (error) {
                console.error("Error creating user:", error);
            }
        } else {
            console.log("user already exists");
        }

        return;
    } catch (error) {
        console.error("Error in ensureDBEntry:", error);
    }
}

