"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Plus, X } from "lucide-react";

interface Card {
  id: string;
  type: 'visa' | 'mastercard' | 'verve' | 'bank';
  number: string;
  isSelected: boolean;
  cardholderName?: string;
}

interface CardDetails {
  number: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function CardsPage({  }: { onBack?: () => void }) {
  const [cards, setCards] = useState<Card[]>([
    {
      id: '1',
      type: 'visa',
      number: '5644 5667 **** 5922',
      isSelected: true,
      cardholderName: 'John Doe'
    },
    {
      id: '2',
      type: 'mastercard',
      number: '5644 5667 **** 5922',
      isSelected: false,
      cardholderName: 'John Doe'
    },
    {
      id: '3',
      type: 'visa',
      number: '5644 5667 **** 5922',
      isSelected: false,
      cardholderName: 'John Doe'
    },
    {
      id: '4',
      type: 'mastercard',
      number: '5644 5667 **** 5922',
      isSelected: false,
      cardholderName: 'John Doe'
    }
  ]);

  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<'visa' | 'mastercard' | 'verve' | 'bank'>('visa');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const cardTypeOptions = [
    { type: 'visa' as const, name: 'Visa', icon: '/visa.svg' },
    { type: 'mastercard' as const, name: 'Mastercard', icon: '/master.svg' },
    { type: 'verve' as const, name: 'Verve', icon: '/verve.svg' },
    { type: 'bank' as const, name: 'Bank Transfer', icon: '/banks.svg' }
  ];

  const handleCardSelect = (cardId: string) => {
    setCards(prev => prev.map(card => ({
      ...card,
      isSelected: card.id === cardId
    })));
  };

  // Card validation functions
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, "");

    if (cleanNumber.match(/^4/)) return "visa";
    if (cleanNumber.match(/^5[1-5]/) || cleanNumber.match(/^2[2-7]/)) return "mastercard";
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

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return '/visa.svg';
      case 'mastercard':
        return '/master.svg';
      case 'verve':
        return '/verve.svg';
      case 'bank':
        return '/banks.svg';
      default:
        return '/visa.svg';
    }
  };

  const getCardLabel = (type: string, number: string) => {
    if (type === 'bank') {
      return 'Bank Transfer';
    }
    return number;
  };

  const isFormValid = () => {
    if (selectedCardType === 'bank') {
      return cardDetails.cardholderName.trim() !== "";
    }
    return (
      isCardNumberValid(cardDetails.number) &&
      cardDetails.expiryDate.length === 5 &&
      cardDetails.cvv.length >= 3 &&
      cardDetails.cardholderName.trim() !== ""
    );
  };

  const handleSaveCard = () => {
    const newCard: Card = {
      id: Date.now().toString(),
      type: selectedCardType,
      number: selectedCardType === 'bank' ? 'Bank Transfer' : maskCardNumber(cardDetails.number),
      isSelected: false,
      cardholderName: cardDetails.cardholderName,
    };

    setCards(prev => [...prev, newCard]);
    setShowAddCardForm(false);
    setCardDetails({
      number: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    });
  };

  const handleAddCardClick = () => {
    setShowAddCardForm(true);
    setCardDetails({
      number: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    });
  };

  if (showAddCardForm) {
    return (
      <div className="w-[600px] bg-white rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddCardForm(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back to cards list"
              >
                <X className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Add New Card</h1>
            </div>
          </div>

          {/* Card Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Card Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {cardTypeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSelectedCardType(option.type)}
                  className={`p-3 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
                    selectedCardType === option.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Image
                    src={option.icon}
                    alt={option.name}
                    width={32}
                    height={20}
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  <span className="text-xs text-gray-600 font-medium">
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-4">
            {selectedCardType !== 'bank' && (
              <>
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
              </>
            )}

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedCardType === 'bank' ? 'Account Holder Name' : 'Cardholder Name'}
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
                onClick={() => setShowAddCardForm(false)}
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
                Add {selectedCardType === 'bank' ? 'Account' : 'Card'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[600px] bg-white rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Cards</h1>
        </div>

        <div className="space-y-3">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardSelect(card.id)}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-6 flex items-center justify-center ">
                  <Image
                    src={getCardIcon(card.type)}
                    alt={`${card.type} card`}
                    width={24}
                    height={15}
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
                <span className="text-gray-700 font-medium">
                  {getCardLabel(card.type, card.number)}
                </span>
              </div>
              {card.isSelected && (
                <div className="w-5 h-5 flex items-center justify-center">
                  <Image
                    src="/check.svg"
                    alt="Selected"
                    width={16}
                    height={16}
                    className="text-green-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add Another Card Button */}
          <div
            onClick={handleAddCardClick}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer border border-dashed border-gray-300 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700 font-medium">Add another card</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Payment Method Icons */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Image
              src="/visa.svg"
              alt="Visa"
              width={40}
              height={25}
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <Image
              src="/master.svg"
              alt="Mastercard"
              width={40}
              height={25}
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <Image
              src="/verve.svg"
              alt="Verve"
              width={40}
              height={25}
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <div className="flex items-center space-x-2">
              <Image
                src="/banks.svg"
                alt="Bank Transfer"
                width={40}
                height={25}
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <span className="text-sm text-gray-600">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}