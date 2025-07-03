import React from 'react';

const ProposalModal = ({ open, onClose, onSubmit, loading, error }) => {
  if (!open) return null;

  const handleSend = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
        <h2 className="text-base font-semibold mb-3">Send Request</h2>
        <form onSubmit={handleSend}>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;
