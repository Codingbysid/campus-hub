
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, Timestamp, where, addDoc, serverTimestamp } from 'firebase/firestore';

export interface LostAndFoundAPIItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  category: string;
  date: string; // Date reported/found (user input)
  location: string;
  tags: string[];
  itemType: 'lost' | 'found'; 
  status: 'active' | 'resolved';
  reporterId: string;
  createdAt: string; // ISO string for API response
}

async function getItems(itemType: 'lost' | 'found') {
  const itemsCollectionRef = collection(db, 'lostAndFoundItems');
  const q = query(
    itemsCollectionRef,
    where('itemType', '==', itemType),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
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
      category: data.category || 'Uncategorized',
      date: data.date || 'Date not specified', // User input date
      location: data.location || 'Unknown Location',
      tags: data.tags || [],
      itemType: data.itemType || itemType,
      status: data.status || 'active',
      reporterId: data.reporterId || '',
      createdAt: createdAtStr,
    } as LostAndFoundAPIItem;
  });
}

// GET handler - existing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'lost' | 'found' | null;

    if (type === 'lost') {
      const lostItems = await getItems('lost');
      return NextResponse.json(lostItems);
    } else if (type === 'found') {
      const foundItems = await getItems('found');
      return NextResponse.json(foundItems);
    } else {
      const lostItems = await getItems('lost');
      const foundItems = await getItems('found');
      return NextResponse.json({ lost: lostItems, found: foundItems });
    }

  } catch (error) {
    console.error('Error fetching lost and found items:', error);
    let errorMessage = 'Failed to fetch items';
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
    const { title, description, category, date, location, tags, itemType, reporterId, imageUrl, imageHint } = body;

    if (!title || !description || !category || !date || !location || !itemType || !reporterId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    if (itemType !== 'lost' && itemType !== 'found') {
        return NextResponse.json({ message: 'Invalid item type' }, { status: 400 });
    }

    const itemsCollectionRef = collection(db, 'lostAndFoundItems');
    const docRef = await addDoc(itemsCollectionRef, {
      title,
      description,
      category,
      date, // Date of loss/finding
      location,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      itemType,
      status: 'active', // New items are active by default
      reporterId,
      imageUrl: imageUrl || 'https://placehold.co/600x400.png',
      imageHint: imageHint || category.toLowerCase() || 'item',
      createdAt: serverTimestamp(), // Timestamp of report creation
    });

    return NextResponse.json({ message: 'Lost/Found item reported successfully', id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error reporting lost/found item:', error);
    let errorMessage = 'Failed to report item';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
