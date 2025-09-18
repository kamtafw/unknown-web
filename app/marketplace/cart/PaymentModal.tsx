"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSelect: (method: string) => void;
}

interface CardDetails {
  number: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface SavedCard {
  id: string;
  type: string;
  number: string;
  icon: string;
  cardholderName: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentSelect,
}: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("visa-5922");
  const [showAddCardForm, setShowAddCardForm] = useState<boolean>(false);
  const [selectedCardType, setSelectedCardType] = useState<string>("");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: "visa-5922",
      type: "visa",
      number: "5644 5667 **** 5922",
      icon: "/visa.svg",
      cardholderName: "John Doe",
    },
    {
      id: "master-5922",
      type: "mastercard",
      number: "5644 5667 **** 5922",
      icon: "/master.svg",
      cardholderName: "John Doe",
    },
  ]);

  if (!isOpen) return null;

  const additionalPaymentOptions = [
    { id: "visa-2", type: "visa", name: "Visa", icon: "/visa 2.svg" },
    {
      id: "master-1",
      type: "mastercard",
      name: "Mastercard",
      icon: "/master 1.svg",
    },
    { id: "verve", type: "verve", name: "Verve", icon: "/verve.svg" },
    {
      id: "bank-transfer",
      type: "bank transfer",
      name: "Bank Transfer",
      icon: "/bank.svg",
    },
  ];

  // Card validation functions
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, "");

    // Visa: starts with 4
    if (cleanNumber.match(/^4/)) return "visa";

    // Mastercard: starts with 5[1-5] or 2[2-7]
    if (cleanNumber.match(/^5[1-5]/) || cleanNumber.match(/^2[2-7]/))
      return "mastercard";

    // Verve: starts with 506, 507, 650, 651
    if (cleanNumber.match(/^(506|507|650|651)/)) return "verve";

    return "";
  };

  const isCardNumberValid = (number: string) => {
    const cleanNumber = number.replace(/\s/g, "");
    return cleanNumber.length >= 16 && detectCardType(number) !== "";
  };

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s/g, "").replace(/[^0-9]/gi, "");
    const matches = cleanValue.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return cleanValue;
    }
  };

  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (cleanValue.length >= 2) {
      return (
        cleanValue.substring(0, 2) +
        (cleanValue.length > 2 ? "/" + cleanValue.substring(2, 4) : "")
      );
    }
    return cleanValue;
  };

  const maskCardNumber = (number: string) => {
    const cleanNumber = number.replace(/\s/g, "");
    if (cleanNumber.length >= 16) {
      const first4 = cleanNumber.substring(0, 4);
      const last4 = cleanNumber.substring(cleanNumber.length - 4);
      return `${first4} **** **** ${last4}`;
    }
    return number;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardDetails((prev) => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setCardDetails((prev) => ({ ...prev, expiryDate: formatted }));
  };

  const handleCvvChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "").substring(0, 4);
    setCardDetails((prev) => ({ ...prev, cvv: cleanValue }));
  };

  const handleAddCardClick = (cardType: string) => {
    if (cardType === "bank-transfer") {
      setSelectedPaymentMethod(cardType);
      setShowAddCardForm(false);
    } else {
      setSelectedCardType(cardType);
      setShowAddCardForm(true);
      setCardDetails({
        number: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
      });
    }
  };

  const handleSaveCard = () => {
    const newCard: SavedCard = {
      id: `${selectedCardType}-${Date.now()}`,
      type: selectedCardType,
      number: maskCardNumber(cardDetails.number),
      icon: getCardIcon(selectedCardType),
      cardholderName: cardDetails.cardholderName,
    };

    setSavedCards((prev) => [...prev, newCard]);
    setSelectedPaymentMethod(newCard.id);
    setShowAddCardForm(false);
    setSelectedCardType("");
    setCardDetails({
      number: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    });
  };

  const getCardIcon = (cardType: string) => {
    switch (cardType) {
      case "visa":
        return "/visa.svg";
      case "mastercard":
        return "/master.svg";
      case "verve":
        return "/verve.svg";
      case "bank transfer":
        return "/banks.svg";
      default:
        return "";
    }
  };

  const isFormValid = () => {
    return (
      isCardNumberValid(cardDetails.number) &&
      cardDetails.expiryDate.length === 5 &&
      cardDetails.cvv.length >= 3 &&
      cardDetails.cardholderName.trim() !== ""
    );
  };

  const getPaymentMethodDisplay = (methodId: string, cards: SavedCard[]) => {
    if (methodId === "bank-transfer") return "Bank Transfer";
    const card = cards.find((c) => c.id === methodId);
    return card
      ? `${card.type.charAt(0).toUpperCase() + card.type.slice(1)} ${
          card.number
        }`
      : methodId;
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-start justify-center p-4 pt-12">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {showAddCardForm && (
              <button
                onClick={() => {
                  setShowAddCardForm(false);
                  setSelectedCardType("");
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back to payment methods"
              >
                <X className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              Payment method
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close payment modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showAddCardForm ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Payment method
              </h3>

              {/* Saved Payment Methods */}
              <div className="space-y-4 mb-8">
                {savedCards.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedPaymentMethod(method.id);
                      onPaymentSelect(
                        getPaymentMethodDisplay(method.id, savedCards)
                      );
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 flex items-center justify-center">
                        <Image
                          src={method.icon}
                          alt={`${method.type} card`}
                          width={40}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {method.number}
                      </span>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Image
                          src="/check.svg"
                          alt="Selected payment method"
                          width={20}
                          height={20}
                          className="text-green-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Another Card Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-900 font-medium">
                    Add another card
                  </span>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Image
                      src="/check.svg"
                      alt="Available options"
                      width={20}
                      height={20}
                      className="text-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  {additionalPaymentOptions.map((option) => (
                    <button
                      key={option.id}
                      className="flex flex-col items-center justify-center p-1 hover:bg-gray-50 transition-colors min-h-[60px]"
                      onClick={() => {
                        if (option.type === "bank transfer") {
                          onPaymentSelect("Bank Transfer");
                        } else {
                          handleAddCardClick(option.type);
                        }
                      }}
                      aria-label={`Add ${option.name} card`}
                      title={`Add ${option.name} card`}
                    >
                      {option.type === "bank transfer" ? (
                        <div className="flex items-center space-x-2">
                          <Image
                            src="/banks.svg"
                            alt="Banks"
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                          <span className="text-xs text-gray-600 font-medium">
                            Bank Transfer
                          </span>
                        </div>
                      ) : (
                        <Image
                          src={option.icon}
                          alt={`${option.name} logo`}
                          width={200}
                          height={200}
                          className="object-contain"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Vouchers Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Image
                        src="/voucher.svg"
                        alt="Gift voucher"
                        width={98}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Image
                        src="/check.svg"
                        alt="Available"
                        width={16}
                        height={16}
                        className="text-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Image
                        src="/voucher 1.svg"
                        alt="Cash back voucher"
                        width={350}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="w-15 h-15 flex items-center justify-center">
                      <Image
                        src="/check.svg"
                        alt="Available"
                        width={16}
                        height={16}
                        className="text-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Voucher Amounts */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ₦300,550
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ₦300,550
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Add Card Form */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-10 mx-auto mb-3 flex items-center justify-center">
                  <Image
                    src={getCardIcon(selectedCardType)}
                    alt={`${selectedCardType} card logo`}
                    width={48}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                  Add {selectedCardType} Card
                </h3>
              </div>

              <form className="space-y-4">
                {/* Card Number */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                      maxLength={19}
                      aria-label="Card number"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      {detectCardType(cardDetails.number) && (
                        <Image
                          src={getCardIcon(detectCardType(cardDetails.number))}
                          alt="Detected card type"
                          width={24}
                          height={15}
                          className="object-contain"
                        />
                      )}
                      {isCardNumberValid(cardDetails.number) && (
                        <Image
                          src="/check.svg"
                          alt="Valid card number"
                          width={16}
                          height={16}
                          className="text-green-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expiry Date and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={5}
                      aria-label="Card expiry date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      placeholder="123"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={4}
                      aria-label="Card CVV security code"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardholderName}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cardholderName: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Cardholder name"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCardForm(false);
                      setSelectedCardType("");
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCard}
                    disabled={!isFormValid()}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isFormValid()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
