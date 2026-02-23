import { NextRequest , NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import {v2 as cloudinary} from "cloudinary";    
import Event from "@/database/event.model";

export async function POST(req: NextRequest){
    try{
        await connectDB();

        const formData = await req.formData(); // Get the form data from the request like the request body

        let event;
        try {
            event =Object.fromEntries(formData.entries()); // Convert form data entries to an object , parsing the event data from the form data
        }       
         catch(e){
            return NextResponse.json({message: "Invalid event data", error: e instanceof Error ? e.message : "Unknown error"}, {status: 400});   
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        const file = formData.get("image") as File; // Get the file from the form data
        if (!file) {
            return NextResponse.json({message: "Image file is required"}, {status: 400});   
        }
        const tags =JSON.parse(formData.get("tags") as string); // Parse the tags from the form data
        const agenda = JSON.parse(formData.get("agenda") as string); // Parse the agenda from the form data
      
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({message: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF"}, {status: 400});
        }
        if (file.size > maxSize) {
            return NextResponse.json({message: "File size exceeds 5MB limit"}, {status: 400});
        }

        // Validate required event fields
        const title = formData.get("title");
        const description = formData.get("description");
        if (!title || !description) {
            return NextResponse.json({message: "Title and description are required"}, {status: 400});
        }        const arrayBuffer = await file.arrayBuffer(); // Convert the file to an array buffer
        const buffer = Buffer.from(arrayBuffer); // Create a buffer from the array buffer
        const uploadResult = await new Promise((resolve, reject) => {
        
            cloudinary.uploader.upload_stream({resource_type: "image", folder: 'DevEvent'}, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }).end(buffer); // End the upload stream with the buffer to start the upload process


        });
         // Upload the image to Cloudinary using the buffer and get the upload result
        // if (!uploadResult || typeof (uploadResult as {secure_url : string}).secure_url !== 'string') {
        //     return NextResponse.json({message: "Image upload failed"}, {status: 500});
        // }
        event.image = (uploadResult as {secure_url: string}).secure_url; // Set the event image to the secure URL from Cloudinary

        // Whitelist allowed fields to prevent mass assignment
        // const eventData = {
        //     title: formData.get("title"),
        //     description: formData.get("description"),
        //     date: formData.get("date"),
        //     location: formData.get("location"),
        //     image: (uploadResult as {secure_url: string}).secure_url,
        // };
        
        const createdEvent = await Event.create(
            {...event, tags:tags, agenda:agenda}
            
        );        return NextResponse.json({message: "Event created successfully", event: createdEvent}, {status: 201}); // Return a success response with the created event data
    }
    catch(e){
        console.error(e);
        return NextResponse.json({message: "Error creating event", error:e instanceof Error ? e.message : "Unknown error"}, {status: 500});   

    }
}

export async function GET(req: NextRequest){

    try {
    await connectDB(); // Connect to the database
    const events = await Event.find().sort({ createdAt: -1 });    return NextResponse.json({message:"Events fetched successfully",events}, {status: 200}); // Return a success response with the list of events
    }
    catch(e){
        return NextResponse.json({message: "Error fetching events", error: e instanceof Error ? e.message : "Unknown error"}, {status: 500});
    }
}