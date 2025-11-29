import { persistentAtom } from '@nanostores/persistent';

export interface Product {
    id: number;
    name: string;
    stock: number;
    price: number;
    images: string[];
}

const INITIAL_PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Cable eléctrico x 20mt',
        stock: 100,
        price: 5000,
        images: ['/images/cable-1.png', '/images/cable-2.png']
    },
    {
        id: 2,
        name: 'Interruptor termo magnético',
        stock: 50,
        price: 1500,
        images: ['/images/interruptor-1.png', '/images/interruptor-2.png']
    },
    {
        id: 3,
        name: 'Tomacorriente',
        stock: 75,
        price: 1200,
        images: ['/images/tomacorriente-1.png', '/images/tomacorriente-2.png']
    },
    {
        id: 4,
        name: 'Lámpara LED',
        stock: 30,
        price: 3500,
        images: ['/images/lampara-1.png', '/images/lampara-2.png']
    },
    {
        id: 5,
        name: 'Cinta aislante',
        stock: 200,
        price: 500,
        images: ['/images/cinta-1.png', '/images/cinta-2.png']
    }
];

export const $products = persistentAtom<Product[]>('products', INITIAL_PRODUCTS, {
    encode: JSON.stringify,
    decode: JSON.parse
});

export function addProduct(product: Omit<Product, 'id'>) {
    const products = $products.get();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { ...product, id: newId };
    $products.set([...products, newProduct]);
}

export function deleteProduct(id: number) {
    const products = $products.get();
    $products.set(products.filter(p => p.id !== id));
}

export function updateProduct(product: Product) {
    const products = $products.get();
    $products.set(products.map(p => p.id === product.id ? product : p));
}
