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
    numPedido?: string; // Optional if they don't select one, but user asked to attach it
    orderId?: string; // Linking to actual ID
    descripcion: string;
    fecha: string;
    status: 'open' | 'closed';
    images?: string[];
    response?: string;
    resolution?: 'accepted' | 'rejected';
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

export function updateUserRole(username: string, role: 'admin' | 'client') {
    const users = $users.get();
    const updated = users.map(u =>
        u.username === username ? { ...u, role } : u
    );
    $users.set(updated);
}

export function deleteUser(username: string) {
    const users = $users.get();
    const filtered = users.filter(u => u.username !== username);
    $users.set(filtered);

    // Delete user's solicitudes
    const solicitudes = $solicitudes.get();
    const filteredSolicitudes = solicitudes.filter(s => s.username !== username);
    $solicitudes.set(filteredSolicitudes);

    // Delete user's reclamos
    const reclamos = $reclamos.get();
    const filteredReclamos = reclamos.filter(r => r.username !== username);
    $reclamos.set(filteredReclamos);
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

export function deleteSolicitud(id: string) {
    const solicitudes = $solicitudes.get();
    const filtered = solicitudes.filter(s => s.id !== id);
    $solicitudes.set(filtered);
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

export function resolveReclamo(id: string, resolution: 'accepted' | 'rejected', response: string) {
    const reclamos = $reclamos.get();
    const reclamo = reclamos.find(r => r.id === id);
    if (!reclamo) return;

    const updatedReclamos = reclamos.map(r =>
        r.id === id ? { ...r, status: 'closed' as const, resolution, response } : r
    );
    $reclamos.set(updatedReclamos);

    if (resolution === 'accepted' && reclamo.orderId) {
        // If claim is accepted, we assume the order is cancelled/refunded
        updateSolicitudStatus(reclamo.orderId, 'rejected');
    }
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
