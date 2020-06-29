import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const payload = await AsyncStorage.getItem('@goMarketplace:products');
      if (payload) setProducts([...JSON.parse(payload)]);
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const payload = products.map(e =>
        e.id === id ? { ...e, quantity: e.quantity + 1 } : e,
      );
      setProducts(payload);
      AsyncStorage.setItem('@goMarketplace:products', JSON.stringify(payload));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const payload = products.map(e =>
        e.id === id ? { ...e, quantity: e.quantity - 1 } : e,
      );
      setProducts(payload);
      AsyncStorage.setItem('@goMarketplace:products', JSON.stringify(payload));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      if (products.find(e => e.id === product.id)) {
        increment(product.id);
      } else {
        const payload = [...products, { ...product, quantity: 1 }];
        setProducts(payload);
        AsyncStorage.setItem(
          '@goMarketplace:products',
          JSON.stringify(payload),
        );
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
