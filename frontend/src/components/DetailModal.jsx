import React from 'react';
import { X, Edit, Trash2 } from 'lucide-react';

function DetailModal({ item, fields, onClose, onEdit, onDelete, title }) {
  if (!item) return null;

  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Details'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {fields.map((field) => (
            <div className="detail-field" key={field.key}>
              <div className="detail-field-label">{field.label}</div>
              <div className="detail-field-value">{formatValue(item[field.key])}</div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          {onEdit && (
            <button className="btn btn-primary" onClick={() => onEdit(item)}>
              <Edit size={16} /> Edit
            </button>
          )}
          {onDelete && (
            <button className="btn btn-danger" onClick={() => onDelete(item)}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
