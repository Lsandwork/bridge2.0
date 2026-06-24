declare global {
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onresult: ((ev: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
    onerror: ((ev: Event) => void) | null;
    start(): void;
    stop(): void;
  }

  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export {};
