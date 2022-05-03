import { Field, FieldArray, Form, Formik } from 'formik';
import React from 'react';
import { useParams } from 'react-router';
import { useChatPerms, useChatState } from '../state/chat';
import { useGroup, useRouteGroup } from '../state/groups';

interface FormSchema {
  writers: string[];
}

export default function ChannelSettings() {
  const groupFlag = useRouteGroup();
  const group = useGroup(groupFlag);
  const { chShip, chName } = useParams();
  const flag = `${chShip}/${chName}`;
  const perm = useChatPerms(flag);
  const initialValues = {
    writers: perm.writers,
  };
  const onSubmit = (values: FormSchema) => {
    useChatState.getState().addSects(flag, values.writers);
  };
  const sects = (curr: string[]) =>
    Object.keys(group.cabals).filter((s) => !curr.includes(s));
  return (
    <Formik onSubmit={onSubmit} initialValues={initialValues}>
      {({ values }) => (
        <Form className="flex w-56 flex-col space-y-2">
          <FieldArray name="writers">
            {({ remove, push }) => {
              const unpicked = sects(values.writers);
              return (
                <>
                  {values.writers.map((writer, idx) => (
                    <div className="flex justify-between p-2">
                      <Field as="select" name={`writers.${idx}`}>
                        <option key={writer} value={writer}>
                          {writer}
                        </option>
                        {unpicked.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Field>
                      <button onClick={() => remove(idx)}>x</button>
                    </div>
                  ))}
                  {unpicked.length > 0 ? (
                    <button type="button" onClick={() => push(unpicked[0])}>
                      Add
                    </button>
                  ) : null}
                </>
              );
            }}
          </FieldArray>
          <button type="submit">Update Writers</button>
        </Form>
      )}
    </Formik>
  );
}
