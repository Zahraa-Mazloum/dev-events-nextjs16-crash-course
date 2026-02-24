'use client';
import { useState } from "react"; 
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({eventId, slug}:{eventId:'string', slug:'string'}) => {
  const [email , setEmail] = useState("");
  const [sumbitted , setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

    const {success} = await createBooking({eventId, slug, email});
    if(success){
      setSubmitted(true);
      posthog.capture('event_booked', {
        eventId,
        slug,
        email
      });
    }
    else{
      console.error('Booking failed');
      posthog.captureException('Booking failed')
    
    }


    
    // setTimeout(() => {
    //       setSubmitted(true);

    // }, 1000);


  }
  
  return (
    <div id="book-event">
      {
        sumbitted ? (
          <p className="text-sm">
            Thank you for booking!

          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">
                Email:
              </label>
              <input
                type="email"
                value={email}  
                onChange={(e)=>setEmail(e.target.value)}
                id="email"
                placeholder="Enter your Email adress"
                />
            </div>
            <button type="submit" className="button-submit" >Submit</button>
          </form>
        )

          
}



    </div>
  )
}

export default BookEvent