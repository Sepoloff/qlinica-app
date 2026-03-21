# Firebase Setup - Qlinica App

## 🔥 **1. Criar Projeto Firebase**

### Passo 1: Ir para Firebase Console
https://console.firebase.google.com/

### Passo 2: Criar Novo Projeto
- Clica "Create Project"
- Nome: `qlinica-app`
- Desativa Google Analytics (por enquanto)
- Clica "Create"

### Passo 3: Setup Web App
- Na Dashboard, clica o ícone `</>` (Web)
- Nome: `qlinica-web`
- Registra a app
- Copia a configuração (vai precisar)

---

## 📦 **2. Dependências a Instalar**

```bash
npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage
```

Ou via Expo:
```bash
npx expo install firebase
```

---

## 🔑 **3. Configuração Firebase**

Criar ficheiro: `src/config/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSy...",        // DA CONSOLE
  authDomain: "qlinica-app.firebaseapp.com",
  projectId: "qlinica-app",
  storageBucket: "qlinica-app.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...:web:abc..."
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## 📊 **4. Estrutura Firestore**

### Collections:
```
users/
  ├── {userId}
  │   ├── email: string
  │   ├── name: string
  │   ├── phone: string
  │   └── createdAt: timestamp

services/
  ├── {serviceId}
  │   ├── name: string
  │   ├── icon: string
  │   ├── description: string
  │   ├── price: number
  │   └── duration: number

therapists/
  ├── {therapistId}
  │   ├── name: string
  │   ├── specialty: string
  │   ├── rating: number
  │   ├── available: boolean
  │   └── avatar: string

bookings/
  ├── {bookingId}
  │   ├── userId: string
  │   ├── serviceId: string
  │   ├── therapistId: string
  │   ├── date: timestamp
  │   ├── time: string
  │   ├── status: string (upcoming/completed/cancelled)
  │   └── createdAt: timestamp
```

---

## 🔐 **5. Firebase Security Rules**

**Firestore Rules:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilizadores só veem seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Serviços públicos
    match /services/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
    
    // Terapeutas públicos
    match /therapists/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
    
    // Marcações
    match /bookings/{bookingId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 💻 **6. Integração no Código**

### Authentication Hook:

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
```

### Booking Service:

```typescript
// src/services/bookingService.ts
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function createBooking(userId: string, booking: any) {
  const docRef = await addDoc(collection(db, 'bookings'), {
    ...booking,
    userId,
    createdAt: new Date(),
    status: 'upcoming'
  });
  return docRef.id;
}

export async function getUserBookings(userId: string) {
  const q = query(collection(db, 'bookings'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## ✅ **7. Checklist Setup**

- [ ] Projeto Firebase criado
- [ ] Web app registrada
- [ ] Config firebase.ts criado
- [ ] Dependências instaladas
- [ ] Firestore criado
- [ ] Collections definidas
- [ ] Security rules aplicadas
- [ ] Hooks de autenticação criados
- [ ] Services de dados criados

---

## 🚀 **8. Depois do Setup**

1. Integrar autenticação na app
2. Carregar dados de Firestore
3. Criar bookings em tempo real
4. Sincronizar com offline support

---

**Status**: Pronto para implementar 🔥
