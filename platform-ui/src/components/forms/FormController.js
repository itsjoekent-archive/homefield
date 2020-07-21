import React from 'react';

const defaultFormControllerContext = {
  formId: '',
  values: {},
  errors: {},
  focus: {},
  hasFocusedOnce: {},
  hasSubmittedOnce: false,
  hasSubmitted: false,
  isSubmissionPending: false,
  formError: null,
};

export const FormControllerContext = React.createContext(defaultFormControllerContext);

export function useFormController() {
  const context = React.useContext(FormControllerContext);

  return context;
}

const SET_FIELD_VALUE = 'SET_FIELD_VALUE';
export const setFieldValue = (fieldId, value) => ({
  type: SET_FIELD_VALUE,
  fieldId,
  value,
});

const SET_FIELD_VALIDATION_ERROR = 'SET_FIELD_VALIDATION_ERROR';
export const setFieldValidationError = (fieldId, error) => ({
  type: SET_FIELD_VALIDATION_ERROR,
  fieldId,
  error,
});

const SET_FIELD_FOCUS = 'SET_FIELD_FOCUS';
export const setFieldFocus = (fieldId, isFocused) => ({
  type: SET_FIELD_FOCUS,
  fieldId,
  isFocused,
});

const INTERNAL_MODIFICATION = 'INTERNAL_MODIFICATION';
const internalModification = (modifier) => ({
  type: INTERNAL_MODIFICATION,
  modifier,
});

function formControllerReducer(state, action) {
  switch (action.type) {
    case SET_FIELD_VALUE: {
      const { fieldId, value } = action;

      return {
        ...state,
        values: {
          ...state.values,
          [fieldId]: value,
        },
      };
    }

    case SET_FIELD_VALIDATION_ERROR: {
      const { fieldId, error } = action;

      return {
        ...state,
        errors: {
          ...state.errors,
          [fieldId]: error,
        },
      };
    }

    case SET_FIELD_FOCUS: {
      const { fieldId, isFocused } = action;

      return {
        ...state,
        focus: {
          ...state.focus,
          [fieldId]: isFocused,
        },
        hasFocusedOnce: {
          ...state.hasFocusedOnce,
          [fieldId]: state.hasFocusedOnce[fieldId] || isFocused,
        },
      };
    }

    case INTERNAL_MODIFICATION: {
      const { modifier } = action;

      return modifier(state);
    }

    default: return state;
  }
}

export default function FormController(props) {
  const {
    children,
    formId,
    onSubmit,
    asyncOnSubmit,
  } = props;

  const [state, dispatch] = React.useReducer(
    formControllerReducer,
    {
      ...defaultFormControllerContext,
      formId,
    },
  );

  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => isMounted.current = false;
  }, []);

  React.useEffect(() => {
    if (state.hasSubmitted && !!asyncOnSubmit && !state.isSubmissionPending) {
      dispatch(internalModification((copy) => ({ ...copy, isSubmissionPending: true })));

      asyncOnSubmit(state)
        .then((update) => {
          if (!isMounted.current) {
            return;
          }

          dispatch(internalModification((copy) => ({
            ...copy,
            hasSubmitted: false,
            isSubmissionPending: false,
            ...(update || {}),
          })));
        })
        .catch((error) => {
          console.error(error);

          if (!isMounted.current) {
            return;
          }

          dispatch(internalModification((copy) => ({
            ...copy,
            hasSubmitted: false,
            isSubmissionPending: false,
            formError: 'Encountered an unexpected error. Try again?',
          })));
      });
    }
  }, [
    state,
    dispatch,
    asyncOnSubmit,
  ]);

  function formOnSubmitHandler(event) {
    event.preventDefault();

    if (!state.hasSubmittedOnce) {
      dispatch(internalModification((state) => ({
        ...state,
        hasSubmittedOnce: true,
        formError: false,
      })));
    }

    if (!Object.values(state.errors).filter(error => !!error).length) {
      dispatch(internalModification((state) => ({
        ...state,
        hasSubmitted: true,
      })));

      if (!asyncOnSubmit && !!onSubmit) {
        onSubmit(state, dispatch);
      }
    }
  }

  const contextValue = { ...state, dispatch };

  return (
    <FormControllerContext.Provider value={contextValue}>
      <form onSubmit={formOnSubmitHandler}>
        {children}
      </form>
    </FormControllerContext.Provider>
  );
}
