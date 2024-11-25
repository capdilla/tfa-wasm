"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface ModalState {
  isOpen: boolean;
  body: React.ReactNode;
  showFooter?: boolean;
}

const defaultState: ModalState = {
  isOpen: false,
  body: null,
  showFooter: false,
};

class ModalHandler {
  state: ModalState;
  setState!: Dispatch<SetStateAction<ModalState>>;

  constructor() {
    this.state = defaultState;
  }

  open(state?: Partial<ModalState>) {
    this.setState((oldState) => ({
      ...oldState,
      isOpen: true,
      ...state,
    }));
  }

  close() {
    this.setState((oldState) => ({
      ...oldState,
      isOpen: false,
    }));
  }

  setStateHandler = (setState: Dispatch<SetStateAction<ModalState>>) => {
    this.setState = setState;
  };
}

interface ModalProps {}

class ModalProps {}

export const modalHandler = new ModalHandler();
export const Modal = ({}: ModalProps) => {
  const [state, setState] = useState<ModalState>(modalHandler.state);

  modalHandler.setStateHandler(setState);

  return (
    <Dialog
      open={state.isOpen}
      onOpenChange={(isOpen) => setState((prev) => ({ ...prev, isOpen }))}
    >
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>Add OTP</DialogTitle>
          <DialogDescription>
            Enter the details for your new OTP.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4">{state.body}</div>
        </div>
        {state.showFooter && (
          <DialogFooter>
            <div>
              <Button variant="ghost" onClick={() => modalHandler.close()}>
                Cancel
              </Button>
            </div>
            <Button>Save</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
