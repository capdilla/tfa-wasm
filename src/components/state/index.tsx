import { TFA } from "@/interfaces";
import { CreateSubState } from "sub-form";

interface State {
  records: TFA[];
  action?: "refetch";
}

export const appState = new CreateSubState<State>({
  records: [],
});
