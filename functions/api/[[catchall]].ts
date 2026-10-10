import { handleWorkerRequest } from '../../src/server/workerHandler';

interface EventContext {
  request: Request;
  env: any;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
  data: Record<string, any>;
}

export const onRequest = async (context: EventContext): Promise<Response> => {
  return handleWorkerRequest(context.request, context.env);
};
