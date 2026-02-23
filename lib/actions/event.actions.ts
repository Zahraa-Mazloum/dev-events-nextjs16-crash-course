'use server';
import  connectDB  from "@/lib/mongodb";
import Event from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
try{
await connectDB();
const event =  await Event.findOne({slug});


//$ne stands for "not equal" and is used to exclude the current event from the results.
//$in operator is used to check if any of the tags in the current event's tags array match with the tags of other events in the database. 
// This way, we can find events that are similar based on their tags, while ensuring that we do not include the current event itself in the results.
//lean() is used to return plain JavaScript objects instead of Mongoose documents
const similarEvents = await Event.find({_id: { $ne: event?._id }, tags: { $in: event?.tags || [] } }).lean(); 
return similarEvents;
// Alternative: directly return the similar events without storing in a variable
// return await Event.find({_id: { $ne: event?._id }, tags: { $in: event?.tags || [] } }); 



}
catch{
//   console.error("Error fetching similar events:", error);
  return [];}

}