import { describe, expect, it, beforeEach } from "vitest";
import {
  approveTessSuggestion,
  createTessSuggestion,
  getTessSuggestions,
  rejectTessSuggestion,
} from "./tess-store";
import { getLocalTasks, getLocalRoutines } from "./local-store";

describe("Tess suggestion approval workflow", () => {
  it("creates pending suggestion", () => {
    const before = getTessSuggestions({ status: "pending" }).length;
    createTessSuggestion({
      childProfileId: "cp1",
      createdByUserId: "user-1",
      suggestionType: "task",
      title: "Brush teeth",
      reason: "Test",
      suggestedPayload: { title: "Brush teeth", points: 5 },
      riskLevel: "low",
    });
    const after = getTessSuggestions({ status: "pending" }).length;
    expect(after).toBeGreaterThan(before);
  });

  it("approves task suggestion and writes to local store", () => {
    const s = createTessSuggestion({
      childProfileId: "cp1",
      createdByUserId: "user-1",
      suggestionType: "task",
      title: "Test task approval",
      reason: "Test",
      suggestedPayload: { title: "Test task approval", points: 3 },
      riskLevel: "low",
    });
    const tasksBefore = getLocalTasks("cp1").length;
    const approved = approveTessSuggestion(s.id, "parent-1");
    expect(approved?.status).toBe("approved");
    expect(getLocalTasks("cp1").length).toBe(tasksBefore + 1);
  });

  it("rejects suggestion", () => {
    const s = createTessSuggestion({
      childProfileId: "cp1",
      createdByUserId: "user-1",
      suggestionType: "routine",
      title: "Reject me",
      reason: "Test",
      suggestedPayload: { title: "Reject me", steps: ["Step 1"] },
      riskLevel: "low",
    });
    const rejected = rejectTessSuggestion(s.id, "parent-1");
    expect(rejected?.status).toBe("rejected");
  });

  it("approves routine suggestion", () => {
    const s = createTessSuggestion({
      childProfileId: "cp1",
      createdByUserId: "user-1",
      suggestionType: "routine",
      title: "Morning routine",
      reason: "Test",
      suggestedPayload: { title: "Morning routine", steps: ["Wake up", "Wash face"] },
      riskLevel: "low",
    });
    const before = getLocalRoutines("cp1").length;
    approveTessSuggestion(s.id, "parent-1");
    expect(getLocalRoutines("cp1").length).toBe(before + 1);
  });
});
