export interface Product {
    id: number;
    name: string;
    stock: number;
    price: number;
    images: string[];
}

export const PRODUCTS: Product[] = [
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
