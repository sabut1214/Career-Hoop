import React from "react";
import { createPortal } from "react-dom";
import Modal from "./Modal";
import { useModal } from "@/context/ModalContext";

export default function ModalContainer() {
  const { modalStack, closeModal, closeAllModals } = useModal();

  if (modalStack.length === 0) return null;

  const modalRoot = document.getElementById("modal-root") || document.body;

  return createPortal(
    <>
      {modalStack.map(({ id, element }, index) => (
        <div key={id} data-modal-layer={index}>
          {typeof element === "function" ? (
            element({ id, close: () => closeModal(id), closeAll: closeAllModals, Modal })
          ) : (
            <Modal isOpen={true} onClose={() => closeModal(id)} title="Modal">
              {element}
            </Modal>
          )}
        </div>
      ))}
    </>,
    modalRoot
  );
}





