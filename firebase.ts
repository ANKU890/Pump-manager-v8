
// FIX: Changed to a named import for Firebase v9+ modular SDK.
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection, 
  getDocs, 
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig.ts';
import type { Owner } from './types.ts';
import { VehicleType } from './types.ts';

// FIX: The `initializeApp` function is called directly when using the modular SDK.
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence enabled using the new method
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Helper function to delete all documents in a collection
export async function deleteAllDocsInCollection(collectionPath: string) {
    const collectionRef = collection(db, collectionPath);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}


// Check for initial data and seed if necessary
seedInitialData();

export async function seedInitialData() {
    // Seed Owners
    const ownersRef = collection(db, 'owners');
    try {
        const ownersSnapshot = await getDocs(ownersRef);
        if (ownersSnapshot.empty) {
            console.log("No owners found, seeding initial data...");
            const initialOwners: Omit<Owner, 'id'>[] = [
                { name: 'Rohan Sharma', vehicles: [{ number: 'MH12AB1234', type: VehicleType.Car }] },
                { name: 'Priya Verma', vehicles: [{ number: 'DL01CD5678', type: VehicleType.Bike }] },
                { name: 'Suresh Kumar', vehicles: [{ number: 'KA05EF9012', type: VehicleType.Truck }] },
            ];
            for (const owner of initialOwners) {
                await addDoc(ownersRef, owner);
            }
            console.log("Initial owners seeded.");
        }
    } catch (error) {
        console.error("Error seeding owners:", error);
    }
    
    // Seed Attendants
    const attendantsRef = collection(db, 'attendants');
    try {
        const attendantsSnapshot = await getDocs(attendantsRef);
        if (attendantsSnapshot.empty) {
            console.log("No attendants found, seeding initial data...");
            const initialAttendants = [
              { name: 'Ankit', avatarUrl: 'https://i.ibb.co/yFzdsKL/ankit.jpg' },
              { name: 'Ashmit', avatarUrl: 'https://picsum.photos/seed/ashmit/100/100' },
            ];
            for (const attendant of initialAttendants) {
                await addDoc(attendantsRef, attendant);
            }
            console.log("Initial attendants seeded.");
        }
    } catch (error) {
        console.error("Error seeding attendants:", error);
    }
}

export { db };