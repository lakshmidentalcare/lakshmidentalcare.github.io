const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({
    where: {
      name: {
        contains: 'pavithran',
        mode: 'insensitive',
      }
    },
    include: {
      treatmentPlans: {
        include: {
          items: true
        }
      },
    }
  });

  console.log(JSON.stringify(patients, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
