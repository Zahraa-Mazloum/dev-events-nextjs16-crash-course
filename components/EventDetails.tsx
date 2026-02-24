import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import { cacheLife } from "next/cache";





const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
}
//small component to display event details with an icon and label
const EventDetailItem = ({icon ,alt, label}:{icon: string, alt: string, label: string}) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
)
  const EventAgenda= ({agendaItems}:{agendaItems: string[]}) => (
<div className="agenda">
<h2>Agenda</h2>
<ul className="flex-col-gap-2">
  {agendaItems.map((item) => (
    <li key={item}>{item}</li>
  ))}
</ul>

</div>
) 
const EventTags=({tags}:{tags: string[]}) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}

      </div>
    ))}
  </div>
)

const EventDetails = async ({params} : {params:Promise<string>} ) => {
      'use cache';
  cacheLife('hours')
  const slug  = await params;
  const response = await fetch(`${BASE_URL}/api/events/${slug}`);
  
  if (!response.ok) {
    return notFound();
  }
  
  const data = await response.json();
  const event = data?.event;

  if (!event) {
    return notFound(); // If no event data is found, return a 404 page
  }
  
  const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;
  
  if (!description || !image || !overview || !date || !time || !location || !mode || !agenda || !audience || !tags || !organizer) {
    return notFound();
  } 
  
  const bookings = 10;
  
  
  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>
<div className="details">
{/* Left Side - Event Content*/}
<div className="content">
  <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />
  <section className="flex flex-col gap-2">
    <h2>Overview</h2>
    <p>{overview}</p>
  </section>

    <section className="flex flex-col gap-2">    <h2>Event Details</h2>
    <EventDetailItem icon="/icons/calendar.svg" alt="Date Icon" label={date} />
    <EventDetailItem icon="/icons/clock.svg" alt="Time Icon" label={time} />
    <EventDetailItem icon="/icons/pin.svg" alt="Location Icon" label={location} />
    <EventDetailItem icon="/icons/mode.svg" alt="Mode Icon" label={mode} />
    <EventDetailItem icon="/icons/audience.svg" alt="Audience Icon" label={audience} />
  </section>
  <EventAgenda agendaItems={(agenda)} />
  <section className="flex-col-gap-2">
    <h2>About the Organizer</h2>
    <p>{organizer}</p>
  </section>
  <EventTags tags={(tags)} />


   </div>

{/* Right Side - Booking Form*/}
<aside className="booking">
  <div className="signup-card">
    <h2>Book Your Spot</h2>
    {bookings > 0 ? (
<p className="text-sm">
  Join {bookings} people who have already booked for this event.

</p>
    ) : ( 
      <p className="text-sm">
        Be the first to book for this event and secure your spot!

      </p>
    )
    
  }
    <BookEvent eventId={event._id} slug={event.slug} />

  </div>
</aside>

</div>


<div className="flex w-full flex-col gap-4 pt-20">
  <h2>Similar Events</h2>
  <div className="events">
    {similarEvents.length > 0 && similarEvents.map((similarEvent :IEvent) => (
      <EventCard key={similarEvent.title} {...similarEvent} /> 
    ))}
  </div>
</div>
    </section>
  )
}

export default EventDetails