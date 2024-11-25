import { TFA } from "@/interfaces";
import { createForm } from "../sub-form";
import { Button } from "../ui/button";
import { FormWrapper } from "sub-form";
import { FormEvent } from "react";
import { getDb } from "@/lib/db";
import { DialogFooter } from "../ui/dialog";
import { modalHandler } from "../ui/Modal";
import { appState } from "../state";

const { createField, useForm } = createForm<TFA>();

interface FormProps {
  record?: TFA;
  recordId?: number;
}
export const Form = (props: FormProps) => {
  const { fields, getFormValues } = useForm({
    defaultState: {
      issuer: props.record?.issuer || "",
      label: props.record?.label || "",
      secret: props.record?.secret || "",
    },
    fields: [
      createField({
        name: "issuer",
        type: "Input",
        componentProps: { label: "Issuer", placeholder: "yourmail@mail.com" },
      }),
      createField({
        name: "label",
        type: "Input",
        componentProps: { label: "Label", placeholder: "AWS" },
      }),
      createField({
        name: "secret",
        type: "Input",
        componentProps: {
          label: "Secret",
          placeholder: "ENA5ZSA56PFCOROWBC2TNXPODIUDX6D",
        },
      }),
    ],
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { values } = getFormValues();

    const record = `otpauth://totp/${values.label}?secret=${values.secret}&issuer=${values.issuer}`;

    const db = await getDb();

    if (props.recordId) {
      await db.update(props.recordId, record);
    } else {
      await db.save(record);
    }

    appState.observer.setKeyState("action", "refetch");

    modalHandler.close();
  };

  const onDelete = async () => {
    if (props.recordId) {
      const db = await getDb();
      await db.delete(props.recordId);

      appState.observer.setKeyState("action", "refetch");
    }

    modalHandler.close();
  };

  return (
    <form onSubmit={onSubmit}>
      <FormWrapper fields={fields} />

      <DialogFooter className="mt-6">
        {props.recordId && (
          <div>
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        )}
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};
