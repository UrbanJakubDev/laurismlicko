-- CreateTable
CREATE TABLE "Baby" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Baby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BabyMeasurement" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "babyId" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "dailyMilkAmount" INTEGER NOT NULL,
    "feedsPerDay" INTEGER NOT NULL DEFAULT 8,
    "averageFeedAmount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BabyMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feed" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "babyId" INTEGER NOT NULL,
    "feedTime" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poop" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "babyId" INTEGER NOT NULL,
    "poopTime" TIMESTAMP(3) NOT NULL,
    "color" TEXT NOT NULL,
    "consistency" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Poop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BabyMeasurement" ADD CONSTRAINT "BabyMeasurement_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feed" ADD CONSTRAINT "Feed_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poop" ADD CONSTRAINT "Poop_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
