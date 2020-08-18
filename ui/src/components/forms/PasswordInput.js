import React from 'react';
import TextInput from 'components/forms/TextInput';
import requiredTextValidator from 'components/forms/requiredTextValidator';

export default function PasswordInput(props) {
  const { fieldIdOverride, labelOverride } = props;

  const fieldId = fieldIdOverride || "password";

  return (
    <TextInput
      fieldId={fieldId}
      label={labelOverride || "Password"}
      htmlType="password"
      onValueChange={requiredTextValidator(fieldId, 'Password', 6)}
    />
  );
}
