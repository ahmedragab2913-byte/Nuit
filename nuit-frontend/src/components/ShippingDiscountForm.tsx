import React, { useState, useEffect } from 'react';

/**
 * Props for ShippingDiscountForm component.
 * - `initialShipping` – starting shipping cost (default 0).
 * - `initialDiscount` – starting discount amount (default 0).
 * - `subtotal` – price of items before shipping/discount.
 * - `onChange` – callback receiving updated { shipping, discount, total }.
 */
interface ShippingDiscountFormProps {
  initialShipping?: number;
  initialDiscount?: number;
  subtotal: number;
  onChange?: (values: { shipping: number; discount: number; total: number }) => void;
}

/**
 * A small, reusable form that lets admins/customers edit shipping and discount values.
 * It instantly recalculates the final total and notifies the parent via `onChange`.
 */
export const ShippingDiscountForm: React.FC<ShippingDiscountFormProps> = ({
  initialShipping = 0,
  initialDiscount = 0,
  subtotal,
  onChange,
}) => {
  const [shipping, setShipping] = useState<number>(initialShipping);
  const [discount, setDiscount] = useState<number>(initialDiscount);
  const [total, setTotal] = useState<number>(subtotal + initialShipping - initialDiscount);

  // Re‑calculate total whenever shipping, discount or subtotal changes.
  useEffect(() => {
    const newTotal = Math.max(0, subtotal + shipping - discount);
    setTotal(newTotal);
    if (onChange) {
      onChange({ shipping, discount, total: newTotal });
    }
  }, [shipping, discount, subtotal, onChange]);

  return (
    <div className="shipping-discount-form" style={containerStyle}>
      <h3 style={headerStyle}>Shipping & Discount</h3>
      <div style={rowStyle}>
        <label style={labelStyle}>Shipping ($):</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={shipping}
          onChange={e => setShipping(parseFloat(e.target.value) || 0)}
          style={inputStyle}
        />
      </div>
      <div style={rowStyle}>
        <label style={labelStyle}>Discount ($):</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={discount}
          onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
          style={inputStyle}
        />
      </div>
      <div style={{ ...rowStyle, fontWeight: 'bold' }}>
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

// Inline style objects to keep the component self‑contained and avoid external CSS files.
const containerStyle: React.CSSProperties = {
  padding: '1rem',
  borderRadius: '0.75rem',
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  color: '#fff',
  maxWidth: '320px',
};

const headerStyle: React.CSSProperties = {
  marginBottom: '0.75rem',
  fontFamily: '"Inter", sans-serif',
  fontSize: '1.1rem',
  textAlign: 'center',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
};

const labelStyle: React.CSSProperties = {
  marginRight: '0.5rem',
  fontSize: '0.95rem',
};

const inputStyle: React.CSSProperties = {
  width: '80px',
  padding: '0.25rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  background: '#fff',
  color: '#000',
};
