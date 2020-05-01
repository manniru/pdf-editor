import App from './App.svelte';

const loadScripts = {};
window.getScript = async (scriptName) => await loadScripts[scriptName];
Array.from(document.querySelectorAll('[data-async]')).forEach((script) => {
  const scriptName = script.id;
  loadScripts[scriptName] = new Promise((resolve, reject) => {
    script.onload = () => {
      resolve(window[scriptName]);
      console.log(`${scriptName} is loaded.`);
    };
    script.onerror = () =>
      reject(`The script ${scriptName} didn't load correctly.`);
  });
});

const app = new App({
  target: document.body,
});

export default app;
