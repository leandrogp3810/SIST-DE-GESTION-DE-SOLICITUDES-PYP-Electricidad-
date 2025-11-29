import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// Types
export interface User {
    username: string;
    password: string;
    role: 'admin' | 'client';
    name?: string;
    email?: string;
    phone?: string;
}

export interface Solicitud {
    id: string;
    username: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    productos: Array<{
        productId: number;
        productName: string;
        cantidad: number;
    }>;
    status: 'pending' | 'approved' | 'rejected' | 'distribution';
    fecha: string;
    billingAddress?: {
        address: string;
        city: string;
        zip: string;
    };
}

export interface Reclamo {
    id: string;
    username: string;
    numPedido: string;
    descripcion: string;
    fecha: string;
    status: 'open' | 'closed';
}

// Persistent stores
export const $users = persistentAtom<User[]>('users', [
    { username: 'admin', password: 'admin123', role: 'admin' }
], {
    encode: JSON.stringify,
    decode: JSON.parse
});

export const $solicitudes = persistentAtom<Solicitud[]>('solicitudes', [], {
    encode: JSON.stringify,
    decode: JSON.parse
});

export const $reclamos = persistentAtom<Reclamo[]>('reclamos', [], {
    encode: JSON.stringify,
    decode: JSON.parse
});

// Session store (persistent)
export const $currentUser = persistentAtom<User | null>('currentUser', null, {
    encode: JSON.stringify,
    decode: JSON.parse
});

// Helper functions
export function login(username: string, password: string): User | null {
    const users = $users.get();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        $currentUser.set(user);
        return user;
    }
    return null;
}

export function logout() {
    $currentUser.set(null);
}

export function createUser(userData: Omit<User, 'role'>): { success: boolean; message: string } {
    const users = $users.get();

    if (users.find(u => u.username === userData.username)) {
        return { success: false, message: 'El usuario ya existe' };
    }

    const newUser: User = {
        ...userData,
        role: 'client'
    };

    $users.set([...users, newUser]);
    return { success: true, message: 'Usuario creado exitosamente' };
}

export function createSolicitud(solicitudData: Omit<Solicitud, 'id' | 'status' | 'fecha'>): string {
    const solicitudes = $solicitudes.get();
    const newSolicitud: Solicitud = {
        ...solicitudData,
        id: Date.now().toString(),
        status: 'pending',
        fecha: new Date().toLocaleString('es-AR')
    };

    $solicitudes.set([...solicitudes, newSolicitud]);
    return newSolicitud.id;
}

export function updateSolicitudStatus(id: string, status: Solicitud['status']) {
    const solicitudes = $solicitudes.get();
    const updated = solicitudes.map(s =>
        s.id === id ? { ...s, status } : s
    );
    $solicitudes.set(updated);
}

export function createReclamo(reclamoData: Omit<Reclamo, 'id' | 'status' | 'fecha'>): string {
    const reclamos = $reclamos.get();
    const newReclamo: Reclamo = {
        ...reclamoData,
        id: Date.now().toString(),
        status: 'open',
        fecha: new Date().toLocaleString('es-AR')
    };

    $reclamos.set([...reclamos, newReclamo]);
    return newReclamo.id;
}

export function getSolicitudesByUser(username: string): Solicitud[] {
    return $solicitudes.get().filter(s => s.username === username);
}

export function getReclamosByUser(username: string): Reclamo[] {
    return $reclamos.get().filter(r => r.username === username);
}

export function getStats() {
    const solicitudes = $solicitudes.get();
    return {
        pendientes: solicitudes.filter(s => s.status === 'pending').length,
        aprobadas: solicitudes.filter(s => s.status === 'approved' || s.status === 'distribution').length,
        rechazadas: solicitudes.filter(s => s.status === 'rejected').length,
        reclamos: $reclamos.get().filter(r => r.status === 'open').length
    };
}
