import { setFieldValidationError } from 'components/forms/FormController';

export default function requiredTextValidator(fieldId, label, minLength = 1) {
  function onValueChange(dispatch, value, fieldError) {
    if (!value) {
      dispatch(setFieldValidationError(fieldId, `${label} is required`));
      return;
    }

    if (value.length < minLength) {
      const message = minLength === 1
        ? `${label} is required`
        : `${label} must be at least ${minLength} characters`;

      dispatch(setFieldValidationError(fieldId, message));
      return;
    }

    if (fieldError) {
      dispatch(setFieldValidationError(fieldId), null);
      return;
    }
  }

  return onValueChange;
}
