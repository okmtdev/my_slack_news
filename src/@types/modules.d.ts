// Type stubs for external packages
// These are minimal declarations used when node_modules are not installed locally.
// Full type definitions are provided by the installed packages at runtime.

declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface Request extends IncomingMessage {
    body: any;
    params: Record<string, string>;
    query: Record<string, string | string[]>;
  }

  export interface Response extends ServerResponse {
    json(data: any): this;
    status(code: number): this;
    send(body: any): this;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface Router {
    get(path: string, handler: (req: Request, res: Response) => void): this;
    post(path: string, handler: (req: Request, res: Response, next?: NextFunction) => void | Promise<void>): this;
    use(...handlers: any[]): this;
  }

  export interface Application extends Router {
    listen(port: number, callback?: () => void): any;
    use(path: string, router: Router): this;
    use(...handlers: any[]): this;
  }

  interface ExpressStatic {
    (): Application;
    json(): any;
    static(root: string, options?: any): any;
    Router(): Router;
  }

  const express: ExpressStatic;
  export = express;
}

declare module 'rss-parser' {
  interface Item {
    title?: string;
    link?: string;
    content?: string;
    contentSnippet?: string;
    pubDate?: string;
    isoDate?: string;
    guid?: string;
    categories?: string[];
    author?: string;
  }

  interface Feed {
    title?: string;
    link?: string;
    description?: string;
    items: Item[];
  }

  interface ParserOptions {
    timeout?: number;
    headers?: Record<string, string>;
    customFields?: {
      feed?: string[];
      item?: string[];
    };
  }

  class Parser {
    constructor(options?: ParserOptions);
    parseURL(url: string): Promise<Feed>;
    parseString(xml: string): Promise<Feed>;
  }

  export = Parser;
}

declare module '@google/generative-ai' {
  interface GenerateContentResult {
    response: {
      text(): string;
    };
  }

  interface GenerativeModel {
    generateContent(prompt: string): Promise<GenerateContentResult>;
  }

  interface ModelParams {
    model: string;
  }

  class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(params: ModelParams): GenerativeModel;
  }

  export { GoogleGenerativeAI };
}

declare module 'axios' {
  interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }

  interface AxiosRequestConfig {
    headers?: Record<string, string>;
    timeout?: number;
    params?: Record<string, any>;
  }

  interface AxiosInstance {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  }

  const axios: AxiosInstance & {
    create(config?: AxiosRequestConfig): AxiosInstance;
  };

  export = axios;
}
