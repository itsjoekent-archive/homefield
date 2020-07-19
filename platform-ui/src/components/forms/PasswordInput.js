import React from 'react';
import TextInput from 'components/forms/TextInput';
import requiredTextValidator from 'components/forms/requiredTextValidator';

export default function PasswordInput() {
  return (
    <TextInput
      fieldId="password"
      label="Password"
      htmlType="password"
      onValueChange={requiredTextValidator('password', 'Password', 6)}
    />
  );
}
