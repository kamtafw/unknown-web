"use client";
import { useState } from "react";
import { User, Trash2, X } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { FaChevronRight } from "react-icons/fa";

interface PaymentCard {
  id: string;
  type: "visa" | "mastercard" | "amex";
  lastFour: string;
  expiryDate: string;
  isActive: boolean;
}

export default function Account() {
  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: "1",
      type: "visa",
      lastFour: "7439",
      expiryDate: "2025-02",
      isActive: true,
    },
    {
      id: "2",
      type: "visa",
      lastFour: "8521",
      expiryDate: "2026-08",
      isActive: false,
    },
  ]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const toggleCard = (id: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, isActive: !card.isActive } : card
      )
    );
  };

  const getCardType = (cardNumber: string): "visa" | "mastercard" | "amex" => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return "visa";
    if (num.startsWith("5") || num.startsWith("2")) return "mastercard";
    if (num.startsWith("34") || num.startsWith("37")) return "amex";
    return "visa";
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: PaymentCard = {
      id: Date.now().toString(),
      type: getCardType(formData.cardNumber),
      lastFour: formData.cardNumber.slice(-4),
      expiryDate: `20${formData.expiryDate.split("/")[1]}-${formData.expiryDate
        .split("/")[0]
        .padStart(2, "0")}`,
      isActive: false,
    };

    setCards((prevCards) => [...prevCards, newCard]);
    setFormData({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    });
    setShowPaymentModal(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "cardNumber") {
      value = formatCardNumber(value);
    } else if (field === "expiryDate") {
      value = formatExpiryDate(value);
    } else if (field === "cvv") {
      value = value.replace(/\D/g, "").substring(0, 4);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const deleteCard = (id: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== id));
    setShowDeleteModal(false);
    setCardToDelete(null);
  };

  const handleDeleteClick = (id: string) => {
    setCardToDelete(id);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Account
        </h1>

        {/* Profile Section */}
        <div className="bg-white  p-4 sm:p-6 mb-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Cameron Williamson
                </h2>
                <p className="text-gray-600">
                  Edit your business and personal info
                </p>
              </div>
            </div>
            <div className="text-gray-400 flex-shrink-0 ml-2">
              <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Payment Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="text-blue-600 font-bold text-lg">
                    {card.type.toUpperCase()}
                  </div>
                  <span className="text-gray-600">
                    ************{card.lastFour}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="text-sm">Credit Card |</span>
                  <span className="text-sm">Expires {card.expiryDate}</span>
                  <div
                    className="text-red-500 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={() => handleDeleteClick(card.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      card.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                    onClick={() => toggleCard(card.id)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        card.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Payment Button */}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors shadow-lg"
        >
          Add Payment
        </button>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-xl font-semibold mb-6">Add Payment Method</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      handleInputChange("cardNumber", e.target.value)
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        handleInputChange("expiryDate", e.target.value)
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) =>
                      handleInputChange("cardholderName", e.target.value)
                    }
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Add this before the closing </div> */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCardToDelete(null);
          }}
          onConfirm={() => cardToDelete && deleteCard(cardToDelete)}
          title="Are you sure you want to remove this payment?"
          confirmText="Remove"
          cancelText="Cancel"
          confirmButtonColor="blue"
        />
      </div>
    </div>
  );
}
