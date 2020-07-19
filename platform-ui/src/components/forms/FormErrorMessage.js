import React from 'react';
import styled from 'styled-components';
import { useFormController } from 'components/forms/FormController';
import { ValidationErrorMessage } from 'components/forms/CommonFormStyledComponents';

const WrappedValidationErrorMessage = styled(ValidationErrorMessage)`
  margin-top: 24px;
`;

export default function FormErrorMessage() {
  const { formError } = useFormController();

  if (!formError) {
    return null;
  }

  return (
    <WrappedValidationErrorMessage>
      {formError}
    </WrappedValidationErrorMessage>
  );
}
