import { SessionData } from '../../services/types';

// Sample valid session data
export const validSessionData: SessionData = {
  logs: [
    {
      id: 1,
      timestamp: '2024-03-20T10:00:00Z',
      method: 'GET',
      url: 'http://example.com',
      status: 200,
      content_length: 1024,
      request: {
        method: 'GET',
        url: 'http://example.com',
        headers: {
          'User-Agent': 'Test Browser',
          'Accept': '*/*'
        },
        content: null
      },
      response: {
        status_code: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': '1024'
        },
        content: null
      }
    }
  ],
  settings: {
    proxy_port: 8080,
    ui_port: 3001,
    debug_level: 'info',
    enable_filtering: true,
    filter_rules: [],
    upstream_proxy_enabled: false,
    upstream_proxy_host: null,
    upstream_proxy_port: null,
    upstream_proxy_auth: false,
    upstream_proxy_username: null,
    upstream_proxy_password: null
  },
  timestamp: '2024-03-20T10:00:00Z'
};

// Mock File implementation
export class MockFile extends Blob {
  name: string;
  lastModified: number;
  _content: string;

  constructor(
    parts: Array<string | Blob | ArrayBuffer | ArrayBufferView>,
    filename: string,
    options?: FilePropertyBag
  ) {
    super(parts, options);
    this.name = filename;
    this.lastModified = Date.now();
    this._content = parts[0] as string;
  }
}

// Mock FileReader implementation
class MockFileReader {
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;

  readonly EMPTY = 0;
  readonly LOADING = 1;
  readonly DONE = 2;

  readyState: 0 | 1 | 2 = 0;
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;

  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

  abort(): void {}
  readAsArrayBuffer(_blob: Blob): void {}
  readAsBinaryString(_blob: Blob): void {}
  readAsDataURL(_blob: Blob): void {}
  addEventListener(_type: string, _listener: EventListenerOrEventListenerObject): void {}
  removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject): void {}
  dispatchEvent(_event: Event): boolean { return true; }

  readAsText(blob: Blob): void {
    this.readyState = 1;
    const content = (blob as any)._content;
    this.result = content;
    this.readyState = 2;

    if (this.onload) {
      const mockFileReader = this as unknown as FileReader;
      const event = {
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false,
        currentTarget: mockFileReader,
        defaultPrevented: false,
        eventPhase: 2,
        isTrusted: true,
        lengthComputable: true,
        loaded: content.length,
        path: [],
        returnValue: true,
        srcElement: mockFileReader,
        target: mockFileReader,
        timeStamp: Date.now(),
        total: content.length,
        type: 'load',
        AT_TARGET: 2,
        BUBBLING_PHASE: 3,
        CAPTURING_PHASE: 1,
        NONE: 0,
        preventDefault() {},
        stopPropagation() {},
        stopImmediatePropagation() {},
        composedPath() { return []; },
        initEvent() {}
      } as ProgressEvent<FileReader>;

      this.onload.call(mockFileReader, event);

      if (this.onloadend) {
        this.onloadend.call(mockFileReader, event);
      }
    }
  }
}

// Replace global File and FileReader
(global as any).File = MockFile;
(global as any).FileReader = MockFileReader;
