
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';

export interface TicketListingAPIItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  category: string; // e.g., Sports, Concert, Theater
  price: string;
  date: string; // Event date (user input)
  location: string; // Event location
  tags: string[];
  sellerId: string;
  createdAt: string; // ISO string for API response
  status: 'available' | 'sold' | 'expired';
}

// GET handler - existing
export async function GET() {
  try {
    const listingsCollectionRef = collection(db, 'ticketListings');
    const q = query(listingsCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const listings: TicketListingAPIItem[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      let createdAtStr = new Date().toISOString();
      if (data.createdAt) {
        if (data.createdAt instanceof Timestamp) {
          createdAtStr = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtStr = data.createdAt;
        } else if (typeof data.createdAt === 'number') {
          createdAtStr = new Date(data.createdAt).toISOString();
        } else if (data.createdAt._seconds) {
          createdAtStr = new Timestamp(data.createdAt._seconds, data.createdAt._nanoseconds).toDate().toISOString();
        }
      }

      return {
        id: doc.id,
        title: data.title || 'No Title',
        description: data.description || '',
        imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
        imageHint: data.imageHint || '',
        category: data.category || 'Event Ticket',
        price: data.price || '$0',
        date: data.date || 'Date TBD', // Event date
        location: data.location || 'Location TBD',
        tags: data.tags || [],
        sellerId: data.sellerId || '',
        status: data.status || 'available',
        createdAt: createdAtStr,
      };
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching ticket listings:', error);
    let errorMessage = 'Failed to fetch ticket listings';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// POST handler - new
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, price, date, location, tags, sellerId, imageUrl, imageHint } = body;

    if (!title || !description || !category || !price || !date || !location || !sellerId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const listingsCollectionRef = collection(db, 'ticketListings');
    const docRef = await addDoc(listingsCollectionRef, {
      title,
      description,
      category,
      price,
      date, // Event date
      location,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      sellerId,
      status: 'available', // New listings are available by default
      imageUrl: imageUrl || 'https://placehold.co/600x400.png',
      imageHint: imageHint || category.toLowerCase() || 'ticket event',
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ message: 'Ticket listed successfully', id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error listing ticket:', error);
    let errorMessage = 'Failed to list ticket';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
