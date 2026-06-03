# Design

## Goal

Provide a mobile-first image editing workbench for applying mosaic operations to a batch of local images without uploading files.

## Audience

The primary user is doing repeated manual review on a smartphone or desktop browser and needs quick image-to-image progress with stable settings.

## Screen Model

- Top toolbar: app identity, import files, import folder, export all, settings-save status, and the single settings show/hide toggle.
- Queue panel: large thumbnail-only buttons, edited-count summary, and internal scrolling for large batches.
- Canvas panel: current image, brush/rectangle editing, undo/reset, previous/next navigation, and generic editing state without file metadata.
- Settings panel: mosaic type, tool, brush size, block size, strength, suffix, export format, and persisted-state indicator.
- Bottom status: active image progress and current tool state.

## UI Direction

- Practical tool UI rather than a marketing page.
- Japanese is the default visible UI language. English copy remains in the i18n module for future controls, but no language-switch UI is shown yet.
- Light neutral background with teal primary actions and amber selection feedback.
- Compact controls, 8px or smaller radii, readable mobile collapse.
- Page-level scrolling is avoided in the primary editor; queue, canvas, and settings surfaces scroll internally when needed.
- Active images align near the top of the canvas work area so imported content is visible immediately.
- File names, image dimensions, and byte sizes are hidden from the queue and editor header to keep the review surface visual-first.
- Export format defaults to `Original extension` so batch output follows the loaded file names unless the user chooses PNG or JPEG.
- No server or upload affordance because local privacy is part of the product contract.

## Responsive Behavior

- Desktop: queue, canvas, and settings are visible in a three-column workspace.
- Tablet/mobile: panels stack, queue becomes a horizontal strip, canvas stays the main work surface.
- Touch input uses pointer events and `touch-action: none` on the canvas.
