// "use client";

// import {
//   createContext,
//   ReactNode,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import { useAuthContext } from "@/context/AuthContext";

// import {
//   addToCart as addToCartRequest,
//   clearCart as clearCartRequest,
//   getCart,
//   removeFromCart as removeFromCartRequest,
//   updateCartItem as updateCartItemRequest,
// } from "@/services/cart.service";

// import {
//   addToWishlist as addToWishlistRequest,
//   clearWishlist as clearWishlistRequest,
//   getWishlist,
//   removeFromWishlist as removeFromWishlistRequest,
// } from "@/services/wishlist.service";

// import { Cart } from "@/types/cart";
// import { Wishlist } from "@/types/wishlist";

// // ======================================================
// // EMPTY STATE
// // ======================================================

// const EMPTY_CART: Cart = {
//   id: null,
//   items: [],
//   itemCount: 0,
//   subtotal: 0,
// };

// const EMPTY_WISHLIST: Wishlist = {
//   id: null,
//   items: [],
//   itemCount: 0,
// };

// // ======================================================
// // CONTEXT TYPE
// // ======================================================

// interface ShopContextValue {
//   cart: Cart;
//   wishlist: Wishlist;

//   cartLoading: boolean;
//   wishlistLoading: boolean;

//   cartMutating: boolean;
//   wishlistMutating: boolean;

//   refreshCart: () => Promise<void>;
//   refreshWishlist: () => Promise<void>;
//   refreshShop: () => Promise<void>;

//   addToCart: (
//     productId: string,
//     quantity?: number
//   ) => Promise<void>;

//   updateCartQuantity: (
//     productId: string,
//     quantity: number
//   ) => Promise<void>;

//   removeFromCart: (
//     productId: string
//   ) => Promise<void>;

//   clearCart: () => Promise<void>;

//   addToWishlist: (
//     productId: string
//   ) => Promise<void>;

//   removeFromWishlist: (
//     productId: string
//   ) => Promise<void>;

//   toggleWishlist: (
//     productId: string
//   ) => Promise<void>;

//   clearWishlist: () => Promise<void>;

//   isInWishlist: (
//     productId: string
//   ) => boolean;

//   isInCart: (
//     productId: string
//   ) => boolean;
// }

// // ======================================================
// // CONTEXT
// // ======================================================

// const ShopContext =
//   createContext<ShopContextValue | undefined>(
//     undefined
//   );

// // ======================================================
// // PROVIDER
// // ======================================================

// export function ShopProvider({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const {
//     user,
//     loading: authLoading,
//   } = useAuthContext();

//   const [cart, setCart] =
//     useState<Cart>(EMPTY_CART);

//   const [wishlist, setWishlist] =
//     useState<Wishlist>(
//       EMPTY_WISHLIST
//     );

//   const [
//     cartLoading,
//     setCartLoading,
//   ] = useState(false);

//   const [
//     wishlistLoading,
//     setWishlistLoading,
//   ] = useState(false);

//   const [
//     cartMutating,
//     setCartMutating,
//   ] = useState(false);

//   const [
//     wishlistMutating,
//     setWishlistMutating,
//   ] = useState(false);

//   // ====================================================
//   // REFRESH CART
//   // ====================================================

//   const refreshCart =
//     useCallback(async () => {
//       if (!user) {
//         setCart(EMPTY_CART);
//         return;
//       }

//       try {
//         setCartLoading(true);

//         const response =
//           await getCart();

//         setCart(response.cart);
//       } catch (error) {
//         console.error(
//           "Failed to load cart:",
//           error
//         );

//         throw error;
//       } finally {
//         setCartLoading(false);
//       }
//     }, [user]);

//   // ====================================================
//   // REFRESH WISHLIST
//   // ====================================================

//   const refreshWishlist =
//     useCallback(async () => {
//       if (!user) {
//         setWishlist(
//           EMPTY_WISHLIST
//         );

//         return;
//       }

//       try {
//         setWishlistLoading(true);

//         const response =
//           await getWishlist();

//         setWishlist(
//           response.wishlist
//         );
//       } catch (error) {
//         console.error(
//           "Failed to load wishlist:",
//           error
//         );

//         throw error;
//       } finally {
//         setWishlistLoading(false);
//       }
//     }, [user]);

//   // ====================================================
//   // REFRESH SHOP
//   // ====================================================

//   const refreshShop =
//     useCallback(async () => {
//       if (!user) {
//         setCart(EMPTY_CART);

//         setWishlist(
//           EMPTY_WISHLIST
//         );

//         return;
//       }

//       await Promise.all([
//         refreshCart(),
//         refreshWishlist(),
//       ]);
//     }, [
//       user,
//       refreshCart,
//       refreshWishlist,
//     ]);

//   // ====================================================
//   // AUTH-AWARE INITIAL LOAD
//   // ====================================================

//   useEffect(() => {
//     if (authLoading) {
//       return;
//     }

//     if (!user) {
//       setCart(EMPTY_CART);

//       setWishlist(
//         EMPTY_WISHLIST
//       );

//       setCartLoading(false);

//       setWishlistLoading(false);

//       return;
//     }

//     const loadShop = async () => {
//       try {
//         await Promise.all([
//           refreshCart(),
//           refreshWishlist(),
//         ]);
//       } catch (error) {
//         console.error(
//           "Failed to initialize shop:",
//           error
//         );
//       }
//     };

//     void loadShop();
//   }, [
//     authLoading,
//     user,
//     refreshCart,
//     refreshWishlist,
//   ]);

//   // ====================================================
//   // ADD TO CART
//   // ====================================================

//   const addToCart =
//     useCallback(
//       async (
//         productId: string,
//         quantity = 1
//       ) => {
//         try {
//           setCartMutating(true);

//           const response =
//             await addToCartRequest({
//               productId,
//               quantity,
//             });

//           setCart(response.cart);
//         } finally {
//           setCartMutating(false);
//         }
//       },
//       []
//     );

//   // ====================================================
//   // UPDATE CART QUANTITY
//   // ====================================================

//   const updateCartQuantity =
//     useCallback(
//       async (
//         productId: string,
//         quantity: number
//       ) => {
//         try {
//           setCartMutating(true);

//           const response =
//             await updateCartItemRequest(
//               productId,
//               {
//                 quantity,
//               }
//             );

//           setCart(response.cart);
//         } finally {
//           setCartMutating(false);
//         }
//       },
//       []
//     );

//   // ====================================================
//   // REMOVE FROM CART
//   // ====================================================

//   const removeFromCart =
//     useCallback(
//       async (
//         productId: string
//       ) => {
//         try {
//           setCartMutating(true);

//           const response =
//             await removeFromCartRequest(
//               productId
//             );

//           setCart(response.cart);
//         } finally {
//           setCartMutating(false);
//         }
//       },
//       []
//     );

//   // ====================================================
//   // CLEAR CART
//   // ====================================================

//   const clearCart =
//     useCallback(async () => {
//       try {
//         setCartMutating(true);

//         const response =
//           await clearCartRequest();

//         setCart(response.cart);
//       } finally {
//         setCartMutating(false);
//       }
//     }, []);

//   // ====================================================
//   // ADD TO WISHLIST
//   // ====================================================

//   const addToWishlist =
//     useCallback(
//       async (
//         productId: string
//       ) => {
//         try {
//           setWishlistMutating(
//             true
//           );

//           const response =
//             await addToWishlistRequest({
//               productId,
//             });

//           setWishlist(
//             response.wishlist
//           );
//         } finally {
//           setWishlistMutating(
//             false
//           );
//         }
//       },
//       []
//     );

//   // ====================================================
//   // REMOVE FROM WISHLIST
//   // ====================================================

//   const removeFromWishlist =
//     useCallback(
//       async (
//         productId: string
//       ) => {
//         try {
//           setWishlistMutating(
//             true
//           );

//           const response =
//             await removeFromWishlistRequest(
//               productId
//             );

//           setWishlist(
//             response.wishlist
//           );
//         } finally {
//           setWishlistMutating(
//             false
//           );
//         }
//       },
//       []
//     );

//   // ====================================================
//   // TOGGLE WISHLIST
//   // ====================================================

//   const toggleWishlist =
//     useCallback(
//       async (
//         productId: string
//       ) => {
//         const exists =
//           wishlist.items.some(
//             (item) =>
//               item.productId ===
//               productId
//           );

//         if (exists) {
//           await removeFromWishlist(
//             productId
//           );

//           return;
//         }

//         await addToWishlist(
//           productId
//         );
//       },
//       [
//         wishlist.items,
//         addToWishlist,
//         removeFromWishlist,
//       ]
//     );

//   // ====================================================
//   // CLEAR WISHLIST
//   // ====================================================

//   const clearWishlist =
//     useCallback(async () => {
//       try {
//         setWishlistMutating(
//           true
//         );

//         const response =
//           await clearWishlistRequest();

//         setWishlist(
//           response.wishlist
//         );
//       } finally {
//         setWishlistMutating(
//           false
//         );
//       }
//     }, []);

//   // ====================================================
//   // IS IN WISHLIST
//   // ====================================================

//   const isInWishlist =
//     useCallback(
//       (
//         productId: string
//       ) => {
//         return wishlist.items.some(
//           (item) =>
//             item.productId ===
//             productId
//         );
//       },
//       [wishlist.items]
//     );

//   // ====================================================
//   // IS IN CART
//   // ====================================================

//   const isInCart =
//     useCallback(
//       (
//         productId: string
//       ) => {
//         return cart.items.some(
//           (item) =>
//             item.productId ===
//             productId
//         );
//       },
//       [cart.items]
//     );

//   // ====================================================
//   // CONTEXT VALUE
//   // ====================================================

//   const value =
//     useMemo<ShopContextValue>(
//       () => ({
//         cart,
//         wishlist,

//         cartLoading,
//         wishlistLoading,

//         cartMutating,
//         wishlistMutating,

//         refreshCart,
//         refreshWishlist,
//         refreshShop,

//         addToCart,
//         updateCartQuantity,
//         removeFromCart,
//         clearCart,

//         addToWishlist,
//         removeFromWishlist,
//         toggleWishlist,
//         clearWishlist,

//         isInWishlist,
//         isInCart,
//       }),
//       [
//         cart,
//         wishlist,

//         cartLoading,
//         wishlistLoading,

//         cartMutating,
//         wishlistMutating,

//         refreshCart,
//         refreshWishlist,
//         refreshShop,

//         addToCart,
//         updateCartQuantity,
//         removeFromCart,
//         clearCart,

//         addToWishlist,
//         removeFromWishlist,
//         toggleWishlist,
//         clearWishlist,

//         isInWishlist,
//         isInCart,
//       ]
//     );

//   return (
//     <ShopContext.Provider
//       value={value}
//     >
//       {children}
//     </ShopContext.Provider>
//   );
// }

// // ======================================================
// // HOOK
// // ======================================================

// export function useShop() {
//   const context =
//     useContext(ShopContext);

//   if (!context) {
//     throw new Error(
//       "useShop must be used inside ShopProvider"
//     );
//   }

//   return context;
// }


"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuthContext } from "@/context/AuthContext";

import {
  addToCart as addToCartRequest,
  clearCart as clearCartRequest,
  getCart,
  removeFromCart as removeFromCartRequest,
  updateCartItem as updateCartItemRequest,
} from "@/services/cart.service";

import {
  addToWishlist as addToWishlistRequest,
  clearWishlist as clearWishlistRequest,
  getWishlist,
  removeFromWishlist as removeFromWishlistRequest,
} from "@/services/wishlist.service";

import { Cart } from "@/types/cart";
import { Wishlist } from "@/types/wishlist";

// ======================================================
// EMPTY STATE
// ======================================================

const EMPTY_CART: Cart = {
  id: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
};

const EMPTY_WISHLIST: Wishlist = {
  id: null,
  items: [],
  itemCount: 0,
};

// ======================================================
// CONTEXT TYPE
// ======================================================

interface ShopContextValue {
  cart: Cart;
  wishlist: Wishlist;

  cartLoading: boolean;
  wishlistLoading: boolean;

  cartMutating: boolean;
  wishlistMutating: boolean;

  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  refreshShop: () => Promise<void>;

  addToCart: (
    productId: string,
    quantity?: number
  ) => Promise<void>;

  updateCartQuantity: (
    productId: string,
    quantity: number
  ) => Promise<void>;

  removeFromCart: (
    productId: string
  ) => Promise<void>;

  clearCart: () => Promise<void>;

  addToWishlist: (
    productId: string
  ) => Promise<void>;

  removeFromWishlist: (
    productId: string
  ) => Promise<void>;

  toggleWishlist: (
    productId: string
  ) => Promise<void>;

  clearWishlist: () => Promise<void>;

  isInWishlist: (
    productId: string
  ) => boolean;

  isInCart: (
    productId: string
  ) => boolean;
}

// ======================================================
// CONTEXT
// ======================================================

const ShopContext =
  createContext<ShopContextValue | undefined>(
    undefined
  );

// ======================================================
// PROVIDER
// ======================================================

export function ShopProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    user,
    loading: authLoading,
  } = useAuthContext();

  // ====================================================
  // CART STATE
  // ====================================================

  const [cart, setCart] =
    useState<Cart>(EMPTY_CART);

  const [
    cartLoading,
    setCartLoading,
  ] = useState(false);

  const [
    cartMutating,
    setCartMutating,
  ] = useState(false);

  // ====================================================
  // WISHLIST STATE
  // ====================================================

  const [wishlist, setWishlist] =
    useState<Wishlist>(
      EMPTY_WISHLIST
    );

  const [
    wishlistLoading,
    setWishlistLoading,
  ] = useState(false);

  const [
    wishlistMutating,
    setWishlistMutating,
  ] = useState(false);

  // ====================================================
  // REFRESH CART
  // ====================================================

  const refreshCart =
    useCallback(async () => {
      if (!user) {
        setCart(EMPTY_CART);
        setCartLoading(false);

        return;
      }

      try {
        setCartLoading(true);

        const response =
          await getCart();

        setCart(response.cart);
      } catch (error) {
        console.error(
          "Failed to load cart:",
          error
        );

        /*
         * Do not keep stale cart data if
         * refreshing the authenticated cart fails.
         */
        setCart(EMPTY_CART);

        throw error;
      } finally {
        setCartLoading(false);
      }
    }, [user]);

  // ====================================================
  // REFRESH WISHLIST
  // ====================================================

  const refreshWishlist =
    useCallback(async () => {
      if (!user) {
        setWishlist(
          EMPTY_WISHLIST
        );

        setWishlistLoading(
          false
        );

        return;
      }

      try {
        setWishlistLoading(
          true
        );

        const response =
          await getWishlist();

        setWishlist(
          response.wishlist
        );
      } catch (error) {
        console.error(
          "Failed to load wishlist:",
          error
        );

        /*
         * Avoid showing wishlist data that may
         * belong to an old session.
         */
        setWishlist(
          EMPTY_WISHLIST
        );

        throw error;
      } finally {
        setWishlistLoading(
          false
        );
      }
    }, [user]);

  // ====================================================
  // REFRESH SHOP
  // ====================================================

  const refreshShop =
    useCallback(async () => {
      if (!user) {
        setCart(
          EMPTY_CART
        );

        setWishlist(
          EMPTY_WISHLIST
        );

        setCartLoading(
          false
        );

        setWishlistLoading(
          false
        );

        return;
      }

      await Promise.all([
        refreshCart(),
        refreshWishlist(),
      ]);
    }, [
      user,
      refreshCart,
      refreshWishlist,
    ]);

  // ====================================================
  // AUTH-AWARE INITIAL LOAD
  // ====================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setCart(
        EMPTY_CART
      );

      setWishlist(
        EMPTY_WISHLIST
      );

      setCartLoading(
        false
      );

      setWishlistLoading(
        false
      );

      setCartMutating(
        false
      );

      setWishlistMutating(
        false
      );

      return;
    }

    const loadShop =
      async () => {
        try {
          await Promise.all([
            refreshCart(),
            refreshWishlist(),
          ]);
        } catch (error) {
          console.error(
            "Failed to initialize shop:",
            error
          );
        }
      };

    void loadShop();
  }, [
    authLoading,
    user,
    refreshCart,
    refreshWishlist,
  ]);

  // ====================================================
  // ADD TO CART
  // ====================================================

  const addToCart =
    useCallback(
      async (
        productId: string,
        quantity = 1
      ) => {
        try {
          setCartMutating(
            true
          );

          const response =
            await addToCartRequest({
              productId,
              quantity,
            });

          setCart(
            response.cart
          );
        } finally {
          setCartMutating(
            false
          );
        }
      },
      []
    );

  // ====================================================
  // UPDATE CART QUANTITY
  // ====================================================

  const updateCartQuantity =
    useCallback(
      async (
        productId: string,
        quantity: number
      ) => {
        try {
          setCartMutating(
            true
          );

          const response =
            await updateCartItemRequest(
              productId,
              {
                quantity,
              }
            );

          setCart(
            response.cart
          );
        } finally {
          setCartMutating(
            false
          );
        }
      },
      []
    );

  // ====================================================
  // REMOVE FROM CART
  // ====================================================

  const removeFromCart =
    useCallback(
      async (
        productId: string
      ) => {
        try {
          setCartMutating(
            true
          );

          const response =
            await removeFromCartRequest(
              productId
            );

          setCart(
            response.cart
          );
        } finally {
          setCartMutating(
            false
          );
        }
      },
      []
    );

  // ====================================================
  // CLEAR CART
  // ====================================================

  const clearCart =
    useCallback(
      async () => {
        try {
          setCartMutating(
            true
          );

          const response =
            await clearCartRequest();

          setCart(
            response.cart
          );
        } finally {
          setCartMutating(
            false
          );
        }
      },
      []
    );

  // ====================================================
  // ADD TO WISHLIST
  // ====================================================

  const addToWishlist =
    useCallback(
      async (
        productId: string
      ) => {
        try {
          setWishlistMutating(
            true
          );

          const response =
            await addToWishlistRequest({
              productId,
            });

          setWishlist(
            response.wishlist
          );
        } finally {
          setWishlistMutating(
            false
          );
        }
      },
      []
    );

  // ====================================================
  // REMOVE FROM WISHLIST
  // ====================================================

  const removeFromWishlist =
    useCallback(
      async (
        productId: string
      ) => {
        try {
          setWishlistMutating(
            true
          );

          const response =
            await removeFromWishlistRequest(
              productId
            );

          setWishlist(
            response.wishlist
          );
        } finally {
          setWishlistMutating(
            false
          );
        }
      },
      []
    );

  // ====================================================
  // TOGGLE WISHLIST
  // ====================================================

  const toggleWishlist =
    useCallback(
      async (
        productId: string
      ) => {
        const exists =
          wishlist.items.some(
            (item) =>
              item.productId ===
              productId
          );

        if (exists) {
          await removeFromWishlist(
            productId
          );

          return;
        }

        await addToWishlist(
          productId
        );
      },
      [
        wishlist.items,
        addToWishlist,
        removeFromWishlist,
      ]
    );

  // ====================================================
  // CLEAR WISHLIST
  // ====================================================

  const clearWishlist =
    useCallback(
      async () => {
        try {
          setWishlistMutating(
            true
          );

          const response =
            await clearWishlistRequest();

          setWishlist(
            response.wishlist
          );
        } finally {
          setWishlistMutating(
            false
          );
        }
      },
      []
    );

  // ====================================================
  // IS IN WISHLIST
  // ====================================================

  const isInWishlist =
    useCallback(
      (
        productId: string
      ) => {
        return wishlist.items.some(
          (item) =>
            item.productId ===
            productId
        );
      },
      [wishlist.items]
    );

  // ====================================================
  // IS IN CART
  // ====================================================

  const isInCart =
    useCallback(
      (
        productId: string
      ) => {
        return cart.items.some(
          (item) =>
            item.productId ===
            productId
        );
      },
      [cart.items]
    );

  // ====================================================
  // CONTEXT VALUE
  // ====================================================

  const value =
    useMemo<ShopContextValue>(
      () => ({
        cart,
        wishlist,

        cartLoading,
        wishlistLoading,

        cartMutating,
        wishlistMutating,

        refreshCart,
        refreshWishlist,
        refreshShop,

        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,

        isInWishlist,
        isInCart,
      }),
      [
        cart,
        wishlist,

        cartLoading,
        wishlistLoading,

        cartMutating,
        wishlistMutating,

        refreshCart,
        refreshWishlist,
        refreshShop,

        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,

        isInWishlist,
        isInCart,
      ]
    );

  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <ShopContext.Provider
      value={value}
    >
      {children}
    </ShopContext.Provider>
  );
}

// ======================================================
// HOOK
// ======================================================

export function useShop() {
  const context =
    useContext(
      ShopContext
    );

  if (!context) {
    throw new Error(
      "useShop must be used inside ShopProvider"
    );
  }

  return context;
}