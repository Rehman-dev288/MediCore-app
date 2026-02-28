import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setCart({
        items: res.data.items || [],
        total: Number(res.data.total) || 0,
      });
    } catch (e) {
      console.error("Cart fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  const addToCart = useCallback(
    async (medicineId, quantity = 1) => {
      await api.post("/cart/add", { medicine_id: medicineId, quantity });
      await fetchCart();
    },
    [fetchCart],
  );
  const updateQuantity = useCallback(
    async (medicineId, quantity) => {
      try {
        await api.put(`/cart/update/${medicineId}`, { quantity });
        await fetchCart();
      } catch (err) {
        console.error("Update quantity failed", err);
      }
    },
    [fetchCart],
  );

  const removeItem = useCallback(
    async (medicineId) => {
      try {
        await api.delete(`/cart/remove/${medicineId}`);
        await fetchCart();
      } catch (err) {
        console.error("Remove item failed", err);
      }
    },
    [fetchCart],
  );
  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart/clear");
      await fetchCart();
      setCart({ items: [], total: 0 });
    } catch (err) {
      console.error("Clear failed", err);
    }
  }, [fetchCart]);
  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
