import React from 'react';

export default function SchemaItem({
  disabled, Actions, Header, Description,
  Right, children, invaild,
}: {
  disabled?: boolean; Actions?: any; Header?: any; Description?: any;
  Right?: any; children?: any; invaild?: Boolean;
}) {
  return (
    <div className={`schema-item${invaild ? ' invaild' : ''}`}>
      { Actions && !disabled && (Actions) }
      <div className="header">
        <div className="left">
          <h3>
            { Header && (Header) }
            { /* TODO: DROPDOWN */ }
          </h3>
          { Description && (Description) }
        </div>
        <div className="right">
          {Right && (Right) }
        </div>
      </div>
      {children}
    </div>
  );
}
