import React from 'react';

export default function SchemaItem({
  disabled, Actions, Header, Description,
  Right, children, invaild,
}: {
  disabled?: boolean; Actions?: any; Header?: any; Description?: any;
  Right?: any; children?: any; invaild?: Boolean;
}) {
  return (
    <div className={`schema-item${invaild ? ' invaild' : ''} `/* todo: container type */}>
      {Actions && !disabled && (Actions)}
      <label>
        <h3>{Header}</h3>
        { /* TODO: DROPDOWN */}
        {Description}
        {Right}
        {children}
      </label>
    </div>
  );
}
