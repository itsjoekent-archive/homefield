import React from 'react';
import TextInput from 'components/forms/TextInput';
import { setFieldValidationError } from 'components/forms/FormController';

export default function PasswordInput(props) {
  const {
    isOptional = false,
  } = props;

  function onValueChange(dispatch, value, fieldError) {
    if (isOptional && !value) {
      return;
    }

    if (!value) {
      dispatch(setFieldValidationError('password', 'Password is required'));
      return;
    }

    if (value.length < 6) {
      dispatch(setFieldValidationError('password', 'Password must be at least 6 characters'));
      return;
    }

    if (fieldError) {
      dispatch(setFieldValidationError('password'), null);
      return;
    }
  }

  return (
    <TextInput
      fieldId="password"
      label="Password"
      htmlType="password"
      onValueChange={onValueChange}
    />
  );
}
