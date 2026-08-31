import { beforeEach, describe, expect, it, vi } from "vitest";
const rows = vi.hoisted(() => ({ profiles: [] as unknown[] }));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock("../src/lib/supabase", () => ({ supabase: { from: vi.fn(() => { const result={data:rows.profiles,error:null}; const builder:any={select:()=>builder,order:()=>builder,eq:()=>builder,in:()=>builder,limit:()=>builder,maybeSingle:()=>Promise.resolve({data:null,error:null}),single:()=>Promise.resolve({data:null,error:null}),then:(resolve:(value:unknown)=>unknown)=>Promise.resolve(result).then(resolve)}; return builder; }), auth:{getUser:vi.fn(async()=>({data:{user:null}}))} } }));
import { CaddieVerificationAdapterError, getCaddieVerificationDetail, listCaddiesForVerification, resetCaddieVerificationMock } from "./caddie-verification";
describe("caddie verification adapter", () => {
  beforeEach(() => { rows.profiles=[]; });
  it("reads the verification queue through Supabase", async () => { await expect(listCaddiesForVerification()).resolves.toEqual([]); await expect(listCaddiesForVerification("pending")).resolves.toEqual([]); });
  it("returns a typed not-found error for an unknown submission", async () => { await expect(getCaddieVerificationDetail("caddie-id")).rejects.toMatchObject<CaddieVerificationAdapterError>({code:"NOT_FOUND"}); expect(resetCaddieVerificationMock()).toBeUndefined(); });
});
