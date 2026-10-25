import test from "node:test";
import assert from "node:assert/strict";
import { resolveDisplayName } from "../apps/admin/src/identity.js";

test("display name prefers the authenticated profile name", () => {
  assert.equal(
    resolveDisplayName({
      profileName: " Monica Lee ",
      authDisplayName: "Different Auth Name",
      email: "monica@example.com",
    }),
    "Monica Lee",
  );
});

test("display name falls back to Firebase Authentication display name", () => {
  assert.equal(
    resolveDisplayName({
      profileName: "  ",
      authDisplayName: "Monica Lee",
      email: "monica@example.com",
    }),
    "Monica Lee",
  );
});

test("display name falls back to the authenticated email prefix", () => {
  assert.equal(
    resolveDisplayName({
      profileName: null,
      authDisplayName: "",
      email: "monica@example.com",
    }),
    "monica",
  );
});

test("display name uses a neutral fallback when identity fields are unavailable", () => {
  assert.equal(resolveDisplayName({}), "there");
  assert.equal(
    resolveDisplayName({
      profileName: " ",
      authDisplayName: null,
      email: " ",
    }),
    "there",
  );
});

test("display name follows the current identity when users change or sign out", () => {
  const firstUser = resolveDisplayName({
    profileName: "Monica",
    authDisplayName: "Monica Auth",
  });
  const secondUser = resolveDisplayName({
    profileName: "",
    authDisplayName: "Jordan",
    email: "jordan@example.com",
  });
  const signedOut = resolveDisplayName({});

  assert.equal(firstUser, "Monica");
  assert.equal(secondUser, "Jordan");
  assert.equal(signedOut, "there");
});
