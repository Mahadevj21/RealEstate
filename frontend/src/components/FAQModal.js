import React, { useState } from 'react';

const FAQs = [
  {
    question: '❓ How do I create an account?',
    answer: 'Click on "Register" from the home page, fill in your details (username, email, password), select your role (Buyer, Seller, or Admin), and submit. Your account will be created instantly.'
  },
  {
    question: '🏠 How can I list a property for sale?',
    answer: 'As a Seller, go to "My Properties" tab in your dashboard and click "+ Add Property". Fill in the property details, upload an image, set the price and location, then click "Add Property". Your property will be visible to all buyers.'
  },
  {
    question: '💰 How does the buying process work?',
    answer: 'As a Buyer, browse available properties, compare prices, and click "Buy" on your preferred property. The seller will receive your request and can accept or reject it. Once accepted, the payment is processed and the property is marked as sold.'
  },
  {
    question: '❤️ What are favorites and how do I use them?',
    answer: 'Favorites are bookmarks for properties you\'re interested in. Click the heart icon on any property to add it to your favorites. You can view all your saved properties in the "My Favorites" tab for easy reference later.'
  },
  {
    question: '🔐 How secure is my account and data?',
    answer: 'We use industry-standard security protocols to protect your account. Your password is encrypted, and all transactions are secured with HTTPS. Never share your login credentials with anyone, and always log out after using public devices.'
  }
];

export const FAQModal = ({ isOpen, onClose }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface-2)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '32px', marginTop: 0 }}>❓ Frequently Asked Questions</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {FAQs.map((faq, index) => (
            <div
              key={index}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: expandedIndex === index ? 'var(--surface-3)' : 'transparent'
              }}
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                {faq.question}
                <span style={{ fontSize: '1.2rem' }}>
                  {expandedIndex === index ? '▼' : '▶'}
                </span>
              </button>
              {expandedIndex === index && (
                <div style={{
                  padding: '0 16px 16px 16px',
                  fontSize: '0.9rem',
                  color: 'var(--text-sub)',
                  lineHeight: '1.6',
                  borderTop: '1px solid var(--border)'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: 'var(--surface-3)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>📧 Need More Help?</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-sub)' }}>
            Contact us at <strong>support@propmanage.com</strong> for any inquiries or issues. We're here to help!
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--grad-aurora)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};
