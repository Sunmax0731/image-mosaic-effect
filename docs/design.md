# Design

## Goal

Provide a mobile-first image editing workbench for applying mosaic operations to a batch of local images without uploading files.

## Audience

The primary user is doing repeated manual review on a smartphone or desktop browser and needs quick image-to-image progress with stable settings.

## Screen Model

- Top toolbar: app identity, import files, import folder, export all, settings-save status, the single settings show/hide toggle, and settings reset.
- Queue panel: large thumbnail-only buttons, edited-count summary, list visibility toggle, list reset action, and internal scrolling for large batches. The visible `画像一覧` heading is intentionally omitted to reserve space for images.
- Canvas panel: current image, preview fit/zoom/pan controls, before/after toggle, brush/rectangle editing, undo/reset, and previous/next navigation without editor status text.
- Settings panel: Fantia/Skeb presets, mosaic type, tool, brush size, block size, strength, suffix, and export format. The visible `設定` heading is intentionally omitted to keep the tool area compact.

## UI Direction

- Practical tool UI rather than a marketing page.
- Japanese is the default visible UI language. English copy remains in the i18n module for future controls, but no language-switch UI is shown yet.
- Light neutral background with teal primary actions and amber selection feedback.
- Compact controls, 8px or smaller radii, readable mobile collapse.
- Import files, import folder, and export all remain on one row on narrow screens.
- Importing individual files appends to the current list; importing a folder replaces the current list so a new batch starts cleanly.
- Loaded images can be cleared manually; successful batch export also clears the image list so the next batch starts from a clean state.
- Page-level scrolling is avoided in the primary editor; queue, canvas, and settings surfaces scroll internally when needed.
- Smartphone settings use horizontal groups for mosaic/tool selection, range controls, and output fields to avoid settings-panel scrolling.
- Smartphone queue selection automatically collapses the image list after a thumbnail is chosen, keeping the selected image close to the top of the editing flow.
- Active images align near the top of the canvas work area so imported content is visible immediately.
- File names, image dimensions, byte sizes, editor state text, and bottom progress/tool text are hidden to keep the review surface visual-first.
- The image list can be collapsed into a narrow rail with one persistent icon button, which leaves more width for the canvas while keeping the reset action nearby.
- Export format defaults to `Original extension` so batch output follows the loaded file names unless the user chooses PNG or JPEG.
- Fantia presets apply strong pixelate or blur settings based on the local reference attachments in `Issues/assets/0001-fantia-skeb/`. Skeb 1% computes `ceil(longEdge * 0.01)` for the pixel block size, with a minimum of 4 px.
- Before/After is a preview-only state: it redraws the active canvas from the original image while preserving the current operation list.
- Preview fit, 100%, zoom, and pan affect only CSS display size and scroll position; canvas pixels, edit coordinates, and export output remain tied to the original image dimensions.
- Brush drags show the clamped bounding rectangle of the brush stamp path while the operation is in progress.
- No server or upload affordance because local privacy is part of the product contract.

## Responsive Behavior

- Desktop: queue, canvas, and settings are visible in a three-column workspace.
- Tablet/mobile: panels stack, queue becomes a larger horizontal strip, canvas stays the main work surface, and settings controls are compacted into horizontal groups.
- When the queue is collapsed on tablet/mobile, the canvas moves closer to the top of the first viewport.
- On mobile widths, choosing an image from the queue collapses the queue automatically; the queue toggle remains available to choose another image.
- Touch input uses pointer events and `touch-action: none` on the canvas.
