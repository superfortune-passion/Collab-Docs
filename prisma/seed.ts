import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice",
      email: "alice@example.com",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob",
      email: "bob@example.com",
    },
  });

  const welcomeContent = JSON.stringify({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Welcome to Collab Docs" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Use the toolbar for ",
          },
          { type: "text", marks: [{ type: "bold" }], text: "bold" },
          { type: "text", text: ", " },
          { type: "text", marks: [{ type: "italic" }], text: "italic" },
          { type: "text", text: ", and lists. Share documents from the editor." },
        ],
      },
    ],
  });

  await prisma.document.upsert({
    where: { id: "seed-welcome-alice" },
    update: {},
    create: {
      id: "seed-welcome-alice",
      title: "Getting Started",
      content: welcomeContent,
      ownerId: alice.id,
    },
  });

  const sharedDoc = await prisma.document.upsert({
    where: { id: "seed-shared-demo" },
    update: {},
    create: {
      id: "seed-shared-demo",
      title: "Team Notes (shared with Bob)",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Alice owns this document and has shared it with Bob for the demo.",
              },
            ],
          },
        ],
      }),
      ownerId: alice.id,
    },
  });

  await prisma.share.upsert({
    where: {
      documentId_userId: {
        documentId: sharedDoc.id,
        userId: bob.id,
      },
    },
    update: {},
    create: {
      documentId: sharedDoc.id,
      userId: bob.id,
    },
  });

  console.log("Seeded users:", { alice: alice.id, bob: bob.id });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
