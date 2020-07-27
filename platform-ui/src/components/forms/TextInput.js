import React from 'react';
import { TextInputBox, TextAreaBox } from 'components/forms/TextInputStyled';
import {
  FormFieldContainer,
  Label,
  HelpMessage,
  ValidationErrorMessage,
} from 'components/forms/CommonFormStyledComponents';
import {
  useFormController,
  setFieldValue,
  setFieldFocus,
} from 'components/forms/FormController';

export default function TextInput(props) {
  const {
    fieldId = '',
    label = '',
    defaultValue = '',
    placeholder = '',
    help = '',
    htmlType = 'text',
    isTextArea = false,
    onValueChange = null,
  } = props;

  const {
    dispatch,
    formId,
    values,
    errors,
    focus,
    hasFocusedOnce,
    hasSubmittedOnce,
  } = useFormController();

  const inputValue = values[fieldId] || '';
  const fieldError = errors[fieldId] || null;

  const hasFieldBeenFocused = !!hasFocusedOnce[fieldId];
  const isFieldFocused = !!focus[fieldId];

  const [hasAppliedDefaultValue, setHasAppliedDefaultValue] = React.useState(false);

  React.useEffect(() => {
    if (!hasAppliedDefaultValue) {
      setHasAppliedDefaultValue(true);
      dispatch(setFieldValue(fieldId, defaultValue));
    }
  }, [
    dispatch,
    fieldId,
    defaultValue,
    hasAppliedDefaultValue,
    setHasAppliedDefaultValue,
  ]);

  React.useEffect(() => {
    if (typeof onValueChange === 'function') {
      onValueChange(dispatch, inputValue, fieldError);
    }
  }, [
    dispatch,
    inputValue,
    fieldError,
    onValueChange,
  ]);

  function onChange(event) {
    const { target: { value } } = event;
    dispatch(setFieldValue(fieldId, value));
  }

  const htmlFieldId = `${formId}-${fieldId}`;

  const shouldHighlightError = (
    hasSubmittedOnce
    && !isFieldFocused
    && !!fieldError
  ) || (
    hasFieldBeenFocused
    && !isFieldFocused
    && !!fieldError
    && !!inputValue
  );

  const InputComponent = isTextArea ? TextAreaBox : TextInputBox;

  return (
    <FormFieldContainer>
      {label && (
        <Label htmlFor={htmlFieldId} hasSubLabel={!!help}>{label}</Label>
      )}
      {help && (
        <HelpMessage>{help}</HelpMessage>
      )}
      <InputComponent
        id={htmlFieldId}
        type={htmlType}
        value={inputValue}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => dispatch(setFieldFocus(fieldId, true))}
        onBlur={() => dispatch(setFieldFocus(fieldId, false))}
        hasError={shouldHighlightError}
      />
      {shouldHighlightError && (
        <ValidationErrorMessage>
          {fieldError}
        </ValidationErrorMessage>
      )}
    </FormFieldContainer>
  );
}
