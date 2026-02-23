'use client';
import { useState } from "react"; 

const BookEvent = () => {
  const [email , setEmail] = useState("");
  const [sumbitted , setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setTimeout(() => {
          setSubmitted(true);

    }, 1000);


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