import { PrismaClient } from '@prisma/client';
import { hashPassword } from "../src/common/utils/password";
import { dump } from "../src/common/const/data";

const prisma = new PrismaClient();

async function main() {
  dump.map(async (item) => {
    const { Credentials, ...userData } = item

    const hash = await hashPassword(Credentials.hash)

    const credentials = await prisma.credentials.create({ data: { hash } })
    const user = await prisma.user.create({ data: { ...userData, credentials_id: credentials.id } });

    // Just to see users that are created in DB during seed process.
    console.log(user);

  });

  return;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();

    console.log(`✅ Successfully seeded: User Model!`)
  });
