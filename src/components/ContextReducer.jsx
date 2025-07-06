import React, { createContext, useContext, useReducer } from "react";

const CartStateContext = createContext();
const CartDispatchContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      // Check if item already exists in cart with same id and selected option
      const existingItemIndex = state.findIndex(
        (item) => item.id === action.id && item.selectedOption === action.selectedOption
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedState = [...state];
        updatedState[existingItemIndex] = {
          ...updatedState[existingItemIndex],
          quantity: updatedState[existingItemIndex].quantity + (action.quantity || 1)
        };
        return updatedState;
      } else {
        // Add new item to cart
        return [
          ...state,
          {
            id: action.id,
            name: action.name,
            des: action.des,
            img: action.img,
            quantity: action.quantity || 1,
            selectedOption: action.selectedOption,
            price: action.price
          },
        ];
      }

    case "REMOVE_FROM_CART":
      // return state.filter(item => item.id !== action.id || item.selectedOption !== action.selectedOption);
      let newArr = [...state]
      newArr.splice(action.id,1)
      return newArr

    case "UPDATE_QUANTITY":
      return state.map(item =>
        item.id === action.id && item.selectedOption === action.selectedOption
          ? { ...item, quantity: action.quantity }
          : item
      );

    case "CLEAR_CART":
      return [];

    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state; // Always return current state for unknown actions
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, []);
  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartStateContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const useDispatchCart = () => {
  const context = useContext(CartDispatchContext);
  if (context === undefined) {
    throw new Error('useDispatchCart must be used within a CartProvider');
  }
  return context;
};