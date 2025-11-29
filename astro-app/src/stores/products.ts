// Product catalog
export const PRODUCTS = [
    { id: 1, name: 'Cable eléctrico', stock: 100, price: 5000 },
    { id: 2, name: 'Interruptor', stock: 50, price: 1500 },
    { id: 3, name: 'Tomacorriente', stock: 75, price: 1200 },
    { id: 4, name: 'Lámpara LED', stock: 30, price: 3500 },
    { id: 5, name: 'Cinta aislante', stock: 200, price: 500 }
];

export type Product = typeof PRODUCTS[0];
