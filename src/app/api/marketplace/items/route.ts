
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

export interface MarketplaceAPIItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  category: string;
  price: string;
  tags: string[];
  sellerId: string;
  createdAt: string; 
}

// GET handler - existing
export async function GET() {
  try {
    const itemsCollectionRef = collection(db, 'marketplaceItems');
    const q = query(itemsCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const items: MarketplaceAPIItem[] = querySnapshot.docs.map((doc) => {
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
        price: data.price || '$0',
        tags: data.tags || [],
        sellerId: data.sellerId || '',
        createdAt: createdAtStr,
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    let errorMessage = 'Failed to fetch marketplace items';
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
    const { title, description, category, price, tags, sellerId, imageUrl, imageHint } = body;

    if (!title || !description || !category || !price || !sellerId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const itemsCollectionRef = collection(db, 'marketplaceItems');
    const docRef = await addDoc(itemsCollectionRef, {
      title,
      description,
      category,
      price,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      sellerId,
      imageUrl: imageUrl || 'https://placehold.co/600x400.png',
      imageHint: imageHint || category.toLowerCase() || 'item',
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ message: 'Marketplace item created successfully', id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating marketplace item:', error);
    let errorMessage = 'Failed to create marketplace item';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
