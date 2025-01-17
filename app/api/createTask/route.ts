import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const tasks = [
  {
    taskType: "daily",
    title: "Join Tectum's Telegram Community",
    imagePath: "/telegram.svg",
    rewards: 100,
    taskUrl: "https://t.me/tectumglobal",
  },
  {
    taskType: "daily",
    title: "Boost Tectum Community Daily",
    imagePath: "/telegram.svg",
    rewards: 50,
    taskUrl: "https://t.me/boost/tectumglobal",
  },
  {
    taskType: "daily",
    title: "Follow Tectum on X",
    imagePath: "/x.svg",
    rewards: 100,
    taskUrl: "https://twitter.com/intent/follow?screen_name=tectumsocial",
  },
  {
    taskType: "daily",
    title: "Download SoftNote Wallet & Create an Account",
    imagePath: "/softlogo.svg",
    rewards: 200,
    taskUrl: "https://wallet.softnote.com/login",
  },
  {
    taskType: "daily",
    title: "Give Us an App Review (iOS)",
    imagePath: "/softlogo.svg",
    rewards: 150,
    taskUrl: "https://play.google.com/store/apps/details?id=com.softnotewallet&pli=1",
  },
  {
    taskType: "daily",
    title: "Give us an App Review (Android)",
    imagePath: "/softlogo.svg",
    rewards: 150,
    taskUrl: "https://play.google.com/store/apps/details?id=com.softnotewallet&pli=1",
  },
  {
    taskType: "daily",
    title: "Follow Tectum on LinkedIn",
    imagePath: "/softlogo.svg",
    rewards: 100,
    taskUrl: "https://www.linkedin.com/showcase/tectum-blockchain",
  },
  {
    taskType: "daily",
    title: "Meet our Founder on X",
    imagePath: "/x.svg",
    rewards: 100,
    taskUrl: "https://twitter.com/intent/follow?screen_name=avguseff",
  },
  {
    taskType: "daily",
    title: "Meet our Founder on LinkedIn",
    imagePath: "/softlogo.svg",
    rewards: 100,
    taskUrl: "https://www.linkedin.com/in/avguseff/",
  },
  {
    taskType: "daily",
    title: "Subscribe to Youtube",
    imagePath: "/Youtube.svg",
    rewards: 100,
    taskUrl: "https://www.youtube.com/channel/UCn17IrKSqmIFn8illLRR2-g?sub_confirmation=1",
  },
  {
    taskType: "daily",
    title: "Follow Tectum on Instagram",
    imagePath: "/IG.svg",
    rewards: 100,
    taskUrl: "https://www.instagram.com/tectum_softnote/",
  },
  {
    taskType: "daily",
    title: "Learn what a SoftNote is?",
    imagePath: "/Youtube.svg",
    rewards: 150,
    taskUrl: "https://youtu.be/9rdGMYrzamc?feature=shared",
  },
];

export async function POST(request: NextRequest) {
  console.log(request.url)
  try {
    // Create all tasks in a transaction
    const createdTasks = await prisma.$transaction(
      tasks.map((task) =>
        prisma.task.create({
          data: task,
        })
      )
    );

    return NextResponse.json({ 
      message: "Tasks created successfully", 
      tasks: createdTasks 
    });
  } catch (error) {
    console.error("Error creating tasks:", error);
    return NextResponse.json(
      { error: "Failed to create tasks" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
