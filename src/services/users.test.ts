import type { QueryActionCreatorResult } from "@reduxjs/toolkit/query";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { AdminUser, AdminUserPage, ListUsersParams } from "@/@types/users";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { CACHE_TAGS, LIST_ID } from "./cache-tags";
import { usersApi } from "./users";

type ListRequest = QueryActionCreatorResult<
  typeof usersApi.endpoints.listUsers.Types.QueryDefinition
>;

interface InvalidatedQuery {
  endpointName: string;
}

const ANA: AdminUser = {
  id: "0199f2a0-0000-7000-8000-00000000000a",
  name: "Ana Souza",
  email: "ana@foody.dev",
  role: "CUSTOMER",
  status: "ACTIVE",
  createdAt: "2026-03-04T15:00:00Z",
  disabledAt: null,
};

const BRUNO: AdminUser = {
  id: "0199f2a0-0000-7000-8000-00000000000b",
  name: "Bruno Lima",
  email: "bruno@foody.dev",
  role: "STAFF",
  status: "ACTIVE",
  createdAt: "2026-02-10T15:00:00Z",
  disabledAt: null,
};

const PAGE: AdminUserPage = {
  data: [ANA, BRUNO],
  meta: { page: 1, pageSize: 10, totalItems: 2, totalPages: 1, hasNext: false, hasPrevious: false },
};

const FIRST_PAGE_BY_NAME: ListUsersParams = { page: 1, pageSize: 10, sort: ["name,asc"] };

function signedInStore(): TestStore {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  return testStore;
}

function recordListRequests(): URL[] {
  const urls: URL[] = [];
  server.use(
    http.get(apiUrl("/admin/users"), ({ request }) => {
      urls.push(new URL(request.url));
      return HttpResponse.json(PAGE);
    }),
  );
  return urls;
}

async function openList({ store }: TestStore, params: ListUsersParams): Promise<ListRequest> {
  const request: ListRequest = store.dispatch(usersApi.endpoints.listUsers.initiate(params));
  await request;
  return request;
}

function queriesInvalidatedBy({ store }: TestStore, id: string): InvalidatedQuery[] {
  return usersApi.util.selectInvalidatedBy(store.getState(), [{ type: CACHE_TAGS.USER, id }]);
}

describe("users service", () => {
  it("asks for the page with the search, filters, page size and sort it was given", async () => {
    const urls: URL[] = recordListRequests();

    await openList(signedInStore(), {
      search: "ana",
      role: "STAFF",
      status: "DISABLED",
      page: 3,
      pageSize: 25,
      sort: ["email,desc"],
    });

    expect(urls).toHaveLength(1);
    expect(urls[0]?.pathname).toBe("/admin/users");
    expect(Object.fromEntries(urls[0]?.searchParams ?? [])).toEqual({
      search: "ana",
      role: "STAFF",
      status: "DISABLED",
      page: "3",
      pageSize: "25",
      sort: "email,desc",
    });
  });

  it("repeats the sort parameter for each property, as the contract declares", async () => {
    const urls: URL[] = recordListRequests();

    await openList(signedInStore(), { ...FIRST_PAGE_BY_NAME, sort: ["role,asc", "name,desc"] });

    expect(urls[0]?.searchParams.getAll("sort")).toEqual(["role,asc", "name,desc"]);
  });

  it("leaves out the search and filters it was not given", async () => {
    const urls: URL[] = recordListRequests();

    await openList(signedInStore(), FIRST_PAGE_BY_NAME);

    expect([...(urls[0]?.searchParams.keys() ?? [])]).toEqual(["page", "pageSize", "sort"]);
  });

  it("tags the list and each user it returned, so a write to any of them refreshes it", async () => {
    recordListRequests();
    const testStore: TestStore = signedInStore();

    await openList(testStore, FIRST_PAGE_BY_NAME);

    expect(queriesInvalidatedBy(testStore, ANA.id)).toEqual([
      expect.objectContaining({ endpointName: "listUsers" }),
    ]);
    expect(queriesInvalidatedBy(testStore, LIST_ID)).toHaveLength(1);
    expect(queriesInvalidatedBy(testStore, "someone-else")).toEqual([]);
  });

  it("sends the new role and refreshes the list once the role changed", async () => {
    const urls: URL[] = recordListRequests();
    const bodies: unknown[] = [];
    server.use(
      http.patch(apiUrl(`/admin/users/${ANA.id}/role`), async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ ...ANA, role: "STAFF" });
      }),
    );
    const testStore: TestStore = signedInStore();
    await openList(testStore, FIRST_PAGE_BY_NAME);

    const changed: AdminUser = await testStore.store
      .dispatch(usersApi.endpoints.changeUserRole.initiate({ id: ANA.id, role: "STAFF" }))
      .unwrap();

    expect(changed.role).toBe("STAFF");
    expect(bodies).toEqual([{ role: "STAFF" }]);
    await vi.waitFor((): void => expect(urls).toHaveLength(2));
  });

  it("disables a user with a POST and refreshes the list", async () => {
    const urls: URL[] = recordListRequests();
    const methods: string[] = [];
    server.use(
      http.post(apiUrl(`/admin/users/${BRUNO.id}/disable`), ({ request }) => {
        methods.push(request.method);
        return HttpResponse.json({ ...BRUNO, status: "DISABLED" });
      }),
    );
    const testStore: TestStore = signedInStore();
    await openList(testStore, FIRST_PAGE_BY_NAME);

    const disabled: AdminUser = await testStore.store
      .dispatch(usersApi.endpoints.disableUser.initiate(BRUNO.id))
      .unwrap();

    expect(disabled.status).toBe("DISABLED");
    expect(methods).toEqual(["POST"]);
    await vi.waitFor((): void => expect(urls).toHaveLength(2));
  });

  it("enables a user with a POST and refreshes the list", async () => {
    const urls: URL[] = recordListRequests();
    server.use(
      http.post(apiUrl(`/admin/users/${BRUNO.id}/enable`), () => HttpResponse.json(BRUNO)),
    );
    const testStore: TestStore = signedInStore();
    await openList(testStore, FIRST_PAGE_BY_NAME);

    const enabled: AdminUser = await testStore.store
      .dispatch(usersApi.endpoints.enableUser.initiate(BRUNO.id))
      .unwrap();

    expect(enabled.status).toBe("ACTIVE");
    await vi.waitFor((): void => expect(urls).toHaveLength(2));
  });

  it("rejects with the API's code when the last active admin would lose the role", async () => {
    server.use(
      http.patch(apiUrl(`/admin/users/${BRUNO.id}/role`), () =>
        HttpResponse.json(problem(422, "LAST_ACTIVE_ADMIN"), { status: 422 }),
      ),
    );
    const { store }: TestStore = signedInStore();

    const change: Promise<AdminUser> = store
      .dispatch(usersApi.endpoints.changeUserRole.initiate({ id: BRUNO.id, role: "CUSTOMER" }))
      .unwrap();

    await expect(change).rejects.toMatchObject({
      status: 422,
      data: { code: "LAST_ACTIVE_ADMIN" },
    });
  });
});
