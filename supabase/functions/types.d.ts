// Minimal ambient declarations to quiet TypeScript in the editor for Deno-based Supabase Edge Functions.
// These do NOT change runtime behavior — Supabase Edge Functions run on Deno and will use real types there.

declare const Deno: any;

// Remote modules used by functions — declare as `any` so the editor doesn't error when resolving imports.
declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: any) => any): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  const createClient: any;
  export { createClient };
  export default createClient;
}

declare module 'https://esm.sh/resend@2.0.0' {
  export class Resend {
    constructor(key?: string);
    emails: { send: (opts: any) => Promise<any> };
  }
}

// Allow Request/Response types as `any` in the project editor environment.
type Request = any;
type Response = any;
