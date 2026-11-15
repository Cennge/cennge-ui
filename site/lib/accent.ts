export const accents = ["orange", "blue", "green", "violet", "red"] as const;
export type Accent = (typeof accents)[number];
export const accentStorageKey = "cennge-docs-accent";

/** Runs in <head> before the first paint, like ThemeScript: the stored accent is on <html> at once. */
export const accentScript = `(function(){try{var a=localStorage.getItem(${JSON.stringify(accentStorageKey)});if(a&&${JSON.stringify(accents)}.indexOf(a)>0)document.documentElement.setAttribute("data-accent",a)}catch(e){}})()`;
