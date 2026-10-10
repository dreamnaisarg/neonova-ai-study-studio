import { handleWorkerRequest, WorkerEnv } from './server/workerHandler';

export default {
  async fetch(request: Request, env: WorkerEnv, _ctx: any): Promise<Response> {
    return handleWorkerRequest(request, env);
  }
};
