
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';

export interface CampusEventAPIItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  category: string; // e.g., Club Meeting, Workshop, Social, Party
  date: string; // Event date and time (user input)
  location: string;
  tags: string[];
  organizerId: string; // User ID of the event promoter
  createdAt: string; // ISO string for API response
}

// GET handler - existing
export async function GET() {
  try {
    const eventsCollectionRef = collection(db, 'campusEvents');
    const q = query(eventsCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const events: CampusEventAPIItem[] = querySnapshot.docs.map((doc) => {
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
        category: data.category || 'Campus Event',
        date: data.date || 'Date & Time TBD', // Event date and time
        location: data.location || 'Location TBD',
        tags: data.tags || [],
        organizerId: data.organizerId || '',
        createdAt: createdAtStr,
      };
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching campus events:', error);
    let errorMessage = 'Failed to fetch campus events';
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
    const { title, description, category, date, location, tags, organizerId, imageUrl, imageHint } = body;

    if (!title || !description || !category || !date || !location || !organizerId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const eventsCollectionRef = collection(db, 'campusEvents');
    const docRef = await addDoc(eventsCollectionRef, {
      title,
      description,
      category,
      date, // Event date and time
      location,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      organizerId,
      imageUrl: imageUrl || 'https://placehold.co/600x400.png',
      imageHint: imageHint || category.toLowerCase() || 'event campus',
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ message: 'Campus event promoted successfully', id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error promoting campus event:', error);
    let errorMessage = 'Failed to promote event';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
