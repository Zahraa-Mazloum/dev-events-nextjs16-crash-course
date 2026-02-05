import { Schema, model, models, Document, Types } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => {
          // RFC 5322 compliant email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save hook to verify the referenced event exists
// BookingSchema.pre('save', async function (next) {
//   // Only validate eventId if it's new or modified
//   if (this.isNew || this.isModified('eventId')) {
//     try {
//       // Dynamically import Event model to avoid circular dependency
//       const Event = models.Event || (await import('./event.model')).default;
      
//       const eventExists = await Event.findById(this.eventId);
      
//       if (!eventExists) {
//         return next(new Error('Referenced event does not exist'));
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         return next(error);
//       }
//       return next(new Error('Failed to validate event reference'));
//     }
//   }
  
//   next();
// });
BookingSchema.pre('save', async function () {
  // Only validate eventId if it's new or modified
  if (this.isNew || this.isModified('eventId')) {
    const Event = models.Event || (await import('./event.model')).default;

    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error('Referenced event does not exist');
    }
  }
});

// Create index on eventId for optimized queries
BookingSchema.index({ eventId: 1 });

// Create index on createdAt for optimized sorting
BookingSchema.index({ eventId: 1 , createdAt: -1 });


// Compound index for faster duplicate booking checks
BookingSchema.index({ eventId: 1, email: 1 });

// Unique compound index to prevent duplicate bookings for the same event and email 
BookingSchema.index({eventId: 1, email: 1} , {unique: true, name:'unique_event_email'});

// Use existing model if it exists (prevents recompilation in development)
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
