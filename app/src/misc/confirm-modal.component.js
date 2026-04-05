import { h, Fragment } from "preact";
import { useStore } from "@nanostores/preact";
import { $confirm, closeConfirm } from "../store/confirm-modal.js";

export default function ConfirmModal() {
  const state = useStore($confirm);

  if (!state.open) return null;

  return (
    <>
      <div
        class="modal-backdrop fade show"
        onClick={() => closeConfirm(false)}
      ></div>

      <div class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{state.title}</h5>
            </div>

            <div class="modal-body">
              <p>{state.message}</p>
            </div>

            <div class="modal-footer">
              <button
                class="btn btn-secondary"
                onClick={() => closeConfirm(false)}
              >
                {state.cancelText}
              </button>

              <button
                class={`btn btn-${state.variant}`}
                onClick={() => closeConfirm(true)}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
