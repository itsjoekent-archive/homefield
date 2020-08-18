import { useFormController } from 'components/forms/FormController';

export default function SubmitButton(props) {
  const { renderButton } = props;
  const { isSubmissionPending } = useFormController();

  return renderButton({
    loading: `${isSubmissionPending}`,
    type: 'submit',
  });
}
