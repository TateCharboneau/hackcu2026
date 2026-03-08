import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

import {ensureDBEntry} from "@/lib/db"

export const { handlers, auth } = NextAuth({
    providers: [Google],
    callbacks: {
        async signIn({ user }) {
            await ensureDBEntry(user?.email ?? "");
            return true;
        }
    }
})