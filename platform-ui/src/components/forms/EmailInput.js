import React from 'react';
import TextInput from 'components/forms/TextInput';
import { setFieldValidationError } from 'components/forms/FormController';

export default function EmailInput(props) {
  const {
    isOptional = false,
  } = props;

  function onValueChange(dispatch, value, fieldError) {
    if (isOptional && !value) {
      return;
    }

    if (!value) {
      dispatch(setFieldValidationError('email', 'Email is required'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(value)) {
      dispatch(setFieldValidationError('email', 'Incorrect email format'));
      return;
    }

    if (fieldError) {
      dispatch(setFieldValidationError('email'), null);
      return;
    }
  }

  return (
    <TextInput
      fieldId="email"
      label="Email"
      placeholder="example@gmail.com"
      htmlType="email"
      onValueChange={onValueChange}
    />
  );
}
