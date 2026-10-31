---
"cennge-ui": patch
---

A popup in a portal opened from a Dialog, Drawer, AlertDialog or CommandDialog scrolls again, also when it is another library's (Radix #1159): the dialog's content now sits inside its overlay. The backdrop is the overlay's `::before`, so a backdrop of your own in `classNames.overlay` takes the `before:` variant, e.g. `before:bg-black/70`.
