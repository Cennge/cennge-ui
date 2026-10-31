---
"cennge-ui": patch
---

A popup in a portal opened from a Dialog, Drawer, AlertDialog or CommandDialog scrolls again, also when it is another library's (Radix #1159): the dialog's content now sits inside its backdrop. The backdrop fades its colour and blur rather than its opacity, so the dialog does not fade twice.
