import { useEffect } from "react";

export default function Modal({ children, isOpen }) {
  useEffect(() => {
    const handleModalState = () => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    };

    handleModalState();

    return () => {
      document.body.style.overflow = "auto"; // Reset overflow when the modal is unmounted
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed z-40 inset-0 flex items-center justify-center bg-gray-500/30">
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
