# Design

## Goal

Provide a mobile-first image editing workbench for applying mosaic operations to a batch of local images without uploading files.

## Audience

The primary user is doing repeated manual review on a smartphone or desktop browser and needs quick image-to-image progress with stable settings.

## Screen Model

- Top toolbar: app identity, import files, import folder, export all, settings-save status.
- Queue panel: thumbnails, file names, edit status, operation count.
- Canvas panel: current image, brush/rectangle editing, undo/reset, previous/next navigation.
- Settings panel: mosaic type, tool, brush size, block size, strength, suffix, export format.
- Bottom status: active image progress and current tool state.

## UI Direction

- Practical tool UI rather than a marketing page.
- Light neutral background with teal primary actions and amber selection feedback.
- Compact controls, 8px or smaller radii, readable mobile collapse.
- No server or upload affordance because local privacy is part of the product contract.

## Responsive Behavior

- Desktop: queue, canvas, and settings are visible in a three-column workspace.
- Tablet/mobile: panels stack, queue becomes a horizontal strip, canvas stays the main work surface.
- Touch input uses pointer events and `touch-action: none` on the canvas.
