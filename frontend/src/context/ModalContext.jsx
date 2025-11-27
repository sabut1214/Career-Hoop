import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalStack, setModalStack] = useState([]);

  const openModal = useCallback((modalElement, options = {}) => {
    const id = options.id || `modal_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setModalStack((prev) => [...prev, { id, element: modalElement }]);
    return id;
  }, []);

  const closeModal = useCallback((id) => {
    if (!id) {
      setModalStack((prev) => prev.slice(0, -1));
      return;
    }
    setModalStack((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      openModal,
      closeModal,
      closeAllModals,
      modalStack,
      hasOpenModal: modalStack.length > 0,
    }),
    [openModal, closeModal, closeAllModals, modalStack]
  );

  return <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return ctx;
}





