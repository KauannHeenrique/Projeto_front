"use client";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

// ✅ Popup de exclusão com quebra de linha garantida
export function DeletePopup({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar exclusão",
  message = "Tem certeza que deseja excluir?\nEssa ação não poderá ser desfeita.",
  confirmText = "Excluir",
  cancelText = "Cancelar",
}: PopupProps) {
  if (!isOpen) return null;

  const formattedMessage = message.replace(/\n/g, "<br />");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center justify-center gap-2">
          <FiAlertTriangle size={20} className="text-red-600" />
          {title}
          <FiAlertTriangle size={20} className="text-red-600" />
        </h2>

        <p
          className="text-sm text-center text-gray-700 mb-6"
          dangerouslySetInnerHTML={{ __html: formattedMessage }}
        ></p>

        <div className="flex justify-center gap-4">
          <Button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ✅ Popup de edição com quebra de linha garantida
export function EditPopup({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar edição",
  message = "Deseja salvar as alterações realizadas?",
  confirmText = "Salvar",
  cancelText = "Cancelar",
}: PopupProps) {
  if (!isOpen) return null;

  const formattedMessage = message.replace(/\n/g, "<br />");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>

        <p
          className="text-sm text-center text-gray-700 mb-6"
          dangerouslySetInnerHTML={{ __html: formattedMessage }}
        ></p>

        <div className="flex justify-center gap-4">
          <Button
            onClick={onClose}
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ✅ Popup de redefinição de senha
export function ResetPasswordPopup({
  isOpen,
  onClose,
  onConfirm,
  title = "Redefinir senha",
  message = "Tem certeza que deseja redefinir a senha?\nA nova senha será enviada por e-mail.",
  confirmText = "Redefinir",
  cancelText = "Cancelar",
}: PopupProps) {
  if (!isOpen) return null;

  const formattedMessage = message.replace(/\n/g, "<br />");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-600 text-center">{title}</h2>

        <p
          className="text-sm text-center text-gray-700 mb-6"
          dangerouslySetInnerHTML={{ __html: formattedMessage }}
        ></p>

        <div className="flex justify-center gap-4">
          <Button
            onClick={onClose}
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
