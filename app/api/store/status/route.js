import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const store = await prisma.store.findFirst({
            where: { userId }
        });
        if (store) {
            return NextResponse.json({ status: store.status });
        } else {
            return NextResponse.json({ status: "not registered" });
        }
    } catch (error) {
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}
