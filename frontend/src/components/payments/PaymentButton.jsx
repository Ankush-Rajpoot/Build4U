import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DollarSign } from 'lucide-react';
import PaymentModal from './PaymentModal';

const PaymentButton = ({ serviceRequest, onPaymentRequested }) => {
  const [showModal, setShowModal] = useState(false);

  const handlePaymentRequested = (paymentRequest) => {
    setShowModal(false);
    onPaymentRequested && onPaymentRequested(paymentRequest);
  };

  if (!serviceRequest || serviceRequest.status === 'pending' || serviceRequest.status === 'cancelled') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors"
      >
        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Request Payment</span>
        <span className="sm:hidden">Payment</span>
      </button>

      {showModal && createPortal(
        <PaymentModal
          open={showModal}
          onClose={() => setShowModal(false)}
          serviceRequest={serviceRequest}
          onPaymentRequested={handlePaymentRequested}
        />,
        document.body
      )}
    </>
  );
};

export default PaymentButton;
