import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { all } from "axios";
import { NextResponse } from "next/server";

// Get Dashboard data for admin (total orders, total stores, total products, total revenue)

export async function GET(request) {

    try {
         const { userId } = getAuth(request)
    const isAdmin = await authAdmin(userId)

    if (!isAdmin) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
        }

    // Get total orders
    const orders = await prisma.order.count()
    // Get total stores on app 
    const stores = await prisma.store.count() 
    // get all orders include createdAt and totalAmount
    const allOrders = await prisma.order.findMany({
        select: { 
            createdAt: true, 
            total: true, 
        }
    })

    let totalRevenue = 0
    allOrders.forEach(order => {
        totalRevenue += order.total
    });

    const revenue = totalRevenue.toFixed(2)
    // Get total products on app
    const products = await prisma.product.count()
    const dashboardData = {
        orders,
        stores,
        products,
        revenue,
        allOrders
    }
    return NextResponse.json({ dashboardData })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}