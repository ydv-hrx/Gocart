import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// create the store  
export async function POST(request) {
    try {
        const authInfo = getAuth(request)
        console.log('Clerk getAuth:', authInfo)
        const { userId } = authInfo
        if (!userId) {
            return NextResponse.json({ error: "User not authenticated or userId missing" }, { status: 401 });
        }
        // Get the data from the form
        const formData = await request.formData()

        const name = formData.get("name")
        const username = formData.get("username")
        const description = formData.get("description")
        const email = formData.get("email")
        const contact = formData.get("contact")
        const address = formData.get("address")
        const image = formData.get("image")

        if(!name || !username || !description || !email || !contact || !address || !image) {
            return NextResponse.json({ error: "missing store info" }, { status: 400 });
         }

        // Ensure user exists in the User table
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    name: name || "Unknown",
                    email: email || "",
                    image: "" // You can update this with Clerk's user image if available
                }
            });
        }

        // check if the user already has a store
        const store = await prisma.store.findFirst({
            where: { userId: userId }
        })

        // if store is already registered then send status of store
        if(store) {
            return NextResponse.json({ status: store.status })
        }

        // check if the username is already taken
        const isUsernameTaken = await prisma.store.findFirst({
            where: { username: username.toLowerCase() }
        })

        if(isUsernameTaken) {
            return NextResponse.json({ error: "username already taken" }, { status: 400 });
        }

        //Image upload to imagekit
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
            file : buffer, //required
            fileName : image.name, //required
            folder: "logos"
        })

        const optimizedImage = imagekit.url({
            path : response.filePath,
            transformation : [
                { quality: 'auto' },
                { format: 'webp' },
                { width: '512' }
            ]
        })

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizedImage
                
            }
                
        })

        // Link store to user
        await prisma.user.update({
            where: { id: userId },
            data: { store: {connect: {id: newStore.id }}}
        })

        return NextResponse.json({ message: "applied, waiting for approval" });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
        
    }
}

// Check the user have already registered store if yes then return the status of store
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
         // check if the user already has a store
        const store = await prisma.store.findFirst({
            where: { userId: userId }
        })

        // if store is already registered then send status of store
        if(store) {
            return NextResponse.json({ status: store.status })
        }
        return NextResponse.json({ status: "not registered" })

    } catch (error) {
         console.log(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}
    