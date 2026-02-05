import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;  
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be online, offline, or hybrid',
      },
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save hook for slug generation, date normalization, and time formatting
// EventSchema.pre('save', function (next) {
//   // "this" is now typed as IEvent automatically

//   if (this.isModified('title')) {
//     this.slug = this.title
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, '')
//       .replace(/\s+/g, '-')
//       .replace(/-+/g, '-')
//       .replace(/^-+|-+$/g, '');
//   }

//   if (this.isModified('date')) {
//     const parsedDate = new Date(this.date);
//     if (isNaN(parsedDate.getTime())) {
//       return next(new Error('Invalid date format'));
//     }
//     this.date = parsedDate.toISOString().split('T')[0];
//   }

//   if (this.isModified('time')) {
//     const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
//     const time12HourRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

//     if (timeRegex.test(this.time.trim())) {
//       this.time = this.time.trim();
//     } else if (time12HourRegex.test(this.time.trim())) {
//       const match = this.time.trim().match(time12HourRegex)!;
//       let hours = parseInt(match[1], 10);
//       const minutes = match[2];
//       const period = match[3].toUpperCase();

//       if (period === 'PM' && hours !== 12) hours += 12;
//       if (period === 'AM' && hours === 12) hours = 0;

//       this.time = `${hours.toString().padStart(2, '0')}:${minutes}`;
//     } else {
//       return next(new Error('Invalid time format. Use HH:MM or HH:MM AM/PM'));
//     }
//   }

//   next();
// });

EventSchema.pre('save', async function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    this.date = parsedDate.toISOString().split('T')[0];
  }

  if (this.isModified('time')) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const time12HourRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

    if (timeRegex.test(this.time.trim())) {
      this.time = this.time.trim();
    } else if (time12HourRegex.test(this.time.trim())) {
      const match = this.time.trim().match(time12HourRegex)!;
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toUpperCase();

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      this.time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    } else {
      throw new Error('Invalid time format. Use HH:MM or HH:MM AM/PM');
    }
  }
});

// Create index on slug for faster queries
EventSchema.index({ slug: 1 });

// Use existing model if it exists (prevents recompilation in development)
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
