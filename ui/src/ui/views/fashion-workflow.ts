import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { CHAT_ATTACHMENT_ACCEPT } from "../chat/attachment-support.ts";
import {
  applyFashionRefineChip,
  applyFashionWorkflowModeDefaults,
  buildFashionWorkflowPromptPreview,
  filesToFashionAttachments,
  type FashionOption,
  type FashionWorkflowFormState,
  FASHION_REFINE_CHIPS,
  FASHION_AGE_BAND_OPTIONS,
  FASHION_BACKGROUND_OPTIONS,
  FASHION_BODY_TYPE_OPTIONS,
  FASHION_FRAMING_OPTIONS,
  FASHION_LOOK_DIRECTION_OPTIONS,
  FASHION_MODE_OPTIONS,
  FASHION_PRESENTATION_OPTIONS,
  FASHION_STYLE_PRESET_OPTIONS,
  FASHION_TONE_OPTIONS,
} from "../fashion-workflow.ts";
import type { ChatAttachment } from "../ui-types.ts";

export type FashionWorkflowPanelProps = {
  state: FashionWorkflowFormState;
  attachments: ChatAttachment[];
  onChange: (patch: Partial<FashionWorkflowFormState>) => void;
  onModeChange: (mode: FashionWorkflowFormState["mode"]) => void;
  onAttachmentsChange: (attachments: ChatAttachment[]) => void;
  onSendToChat: () => void;
  onGenerateNow: () => void;
};

function renderSelect<T extends string>(params: {
  label: string;
  value: T;
  options: FashionOption<T>[];
  onChange: (value: T) => void;
}) {
  return html`
    <label class="field">
      <span>${params.label}</span>
      <select @change=${(e: Event) => params.onChange((e.target as HTMLSelectElement).value as T)}>
        ${params.options.map(
          (option) => html`
            <option value=${option.value} ?selected=${params.value === option.value}>
              ${option.label}
            </option>
          `,
        )}
      </select>
    </label>
  `;
}

export function renderFashionWorkflowPanel(props: FashionWorkflowPanelProps) {
  const promptPreview = buildFashionWorkflowPromptPreview(props.state);
  let fileInput: HTMLInputElement | null = null;
  return html`
    <section class="card">
      <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div>
          <div class="card-title">Fashion Workflow MVP</div>
          <div class="card-sub">
            Structured prompt builder for designers and buyers. This prepares a fashion-ready
            <code>image_generate</code> request without requiring prompt engineering.
          </div>
        </div>
        <div class="row" style="gap: 8px; flex-wrap: wrap;">
          <button class="btn" @click=${() => fileInput?.click()}>Add Garment Photos</button>
          <button class="btn" @click=${props.onSendToChat}>Send To Chat</button>
          <button class="btn primary" @click=${props.onGenerateNow}>Generate Now</button>
        </div>
      </div>

      <input
        ${ref((value) => {
          fileInput = value as HTMLInputElement | null;
        })}
        type="file"
        accept=${CHAT_ATTACHMENT_ACCEPT}
        multiple
        hidden
        @change=${async (e: Event) => {
          const input = e.target as HTMLInputElement;
          const files = input.files;
          if (!files || files.length === 0) {
            return;
          }
          const additions = await filesToFashionAttachments(files);
          if (additions.length > 0) {
            props.onAttachmentsChange([...props.attachments, ...additions]);
          }
          input.value = "";
        }}
      />

      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 16px;"
      >
        ${renderSelect({
          label: "Mode",
          value: props.state.mode,
          options: FASHION_MODE_OPTIONS,
          onChange: (mode) => props.onModeChange(mode),
        })}
        ${renderSelect({
          label: "Style Preset",
          value: props.state.stylePreset,
          options: FASHION_STYLE_PRESET_OPTIONS,
          onChange: (stylePreset) => props.onChange({ stylePreset }),
        })}
        ${renderSelect({
          label: "Background",
          value: props.state.background,
          options: FASHION_BACKGROUND_OPTIONS,
          onChange: (background) => props.onChange({ background }),
        })}
        ${renderSelect({
          label: "Framing",
          value: props.state.framing,
          options: FASHION_FRAMING_OPTIONS,
          onChange: (framing) => props.onChange({ framing }),
        })}
        ${renderSelect({
          label: "Tone",
          value: props.state.tone,
          options: FASHION_TONE_OPTIONS,
          onChange: (tone) => props.onChange({ tone }),
        })}
        ${renderSelect({
          label: "Presentation",
          value: props.state.presentation,
          options: FASHION_PRESENTATION_OPTIONS,
          onChange: (presentation) => props.onChange({ presentation }),
        })}
        ${renderSelect({
          label: "Age Band",
          value: props.state.ageBand,
          options: FASHION_AGE_BAND_OPTIONS,
          onChange: (ageBand) => props.onChange({ ageBand }),
        })}
        ${renderSelect({
          label: "Body Type",
          value: props.state.bodyType,
          options: FASHION_BODY_TYPE_OPTIONS,
          onChange: (bodyType) => props.onChange({ bodyType }),
        })}
        ${renderSelect({
          label: "Look Direction",
          value: props.state.lookDirection,
          options: FASHION_LOOK_DIRECTION_OPTIONS,
          onChange: (lookDirection) => props.onChange({ lookDirection }),
        })}
        <label class="field">
          <span>Product Name</span>
          <input
            .value=${props.state.productName}
            @input=${(e: Event) =>
              props.onChange({ productName: (e.target as HTMLInputElement).value })}
            placeholder="Structured leather tote"
          />
        </label>
        <label class="field">
          <span>Category</span>
          <input
            .value=${props.state.category}
            @input=${(e: Event) => props.onChange({ category: (e.target as HTMLInputElement).value })}
            placeholder="bag"
          />
        </label>
        <label class="field" style="grid-column: 1 / -1;">
          <span>Garment Details</span>
          <input
            .value=${props.state.garmentDetails}
            @input=${(e: Event) =>
              props.onChange({ garmentDetails: (e.target as HTMLInputElement).value })}
            placeholder="double-breasted, peak lapel, wool twill, gold hardware"
          />
        </label>
        <label class="field" style="grid-column: 1 / -1;">
          <span>Notes</span>
          <textarea
            rows="3"
            .value=${props.state.notes}
            @input=${(e: Event) => props.onChange({ notes: (e.target as HTMLTextAreaElement).value })}
            placeholder="Keep the garment close to the original and emphasize premium fabric realism."
          ></textarea>
        </label>
      </div>

      ${
        props.attachments.length > 0
          ? html`
              <div style="margin-top: 16px;">
                <div class="label" style="margin-bottom: 8px;">Staged Garment Photos</div>
                <div class="chat-attachments-preview">
                  ${props.attachments.map(
                    (att) => html`
                      <div class="chat-attachment-thumb">
                        <img src=${att.dataUrl} alt="Garment reference" />
                        <button
                          class="chat-attachment-remove"
                          type="button"
                          aria-label="Remove garment photo"
                          @click=${() =>
                            props.onAttachmentsChange(
                              props.attachments.filter((item) => item.id !== att.id),
                            )}
                        >
                          &times;
                        </button>
                      </div>
                    `,
                  )}
                </div>
              </div>
            `
          : html`
              <div class="callout" style="margin-top: 16px">
                Add front, back, detail, or fabric shots here. They will be transferred into chat as reference
                images when you choose Send To Chat.
              </div>
            `
      }

      <div style="margin-top: 16px;">
        <div class="row" style="justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
          <div class="label">Quick Refine</div>
          <button
            type="button"
            class="btn btn--sm"
            @click=${() => props.onChange(applyFashionWorkflowModeDefaults(props.state, props.state.mode))}
          >
            Reset To Mode Defaults
          </button>
        </div>
        <div class="row" style="gap: 8px; flex-wrap: wrap;">
          ${FASHION_REFINE_CHIPS.map(
            (chip) => html`
              <button
                type="button"
                class="btn btn--sm"
                @click=${() => props.onChange(applyFashionRefineChip(props.state, chip))}
              >
                ${chip}
              </button>
            `,
          )}
        </div>
      </div>

      <div class="callout info" style="margin-top: 16px;">
        Current MVP behavior: this panel generates a structured prompt and sends it to chat. Attach
        garment photos here or in chat and ask OpenClaw to use them as reference images.
      </div>

      <label class="field" style="margin-top: 16px;">
        <span>Prompt Preview</span>
        <textarea rows="12" readonly .value=${promptPreview}></textarea>
      </label>
    </section>
  `;
}
