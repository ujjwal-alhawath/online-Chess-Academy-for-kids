import type { Request, Response } from 'express';
import app from '../src/server';

/**
 * Vercel Serverless Function entry point.
 * Wraps Express application to handle invocations safely across CommonJS & ESM.
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}

// CommonJS compatibility for @vercel/node
module.exports = handler;


