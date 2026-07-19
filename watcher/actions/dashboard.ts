'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getDecryptedEnvVars } from './envActions';
import { formatDistanceToNow } from 'date-fns';

export async function getInstances() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const instances = await prisma.instance.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return instances;
}

export async function getDashboardStats() {
  let totalPRs = 0;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) {
      const instances = await prisma.instance.findMany({
        where: { userId: session.user.id },
      });

      for (const instance of instances) {
        try {
          const envVars = await getDecryptedEnvVars(instance.id);
          if (envVars.GITHUB_TOKEN && envVars.GITHUB_REPO_OWNER && envVars.GITHUB_REPO_NAME) {
            const response = await fetch(
              `https://api.github.com/search/issues?q=repo:${envVars.GITHUB_REPO_OWNER}/${envVars.GITHUB_REPO_NAME}+type:pr`,
              {
                headers: {
                  Authorization: `Bearer ${envVars.GITHUB_TOKEN}`,
                  Accept: 'application/vnd.github.v3+json',
                },
                next: { revalidate: 60 }
              }
            );

            if (response.ok) {
              const data = await response.json();
              totalPRs += data.total_count || 0;
            } else {
              console.error(`Failed to fetch PR count for ${instance.name}:`, await response.text());
            }
          }
        } catch (err) {
          console.error(`Error fetching PR count for instance ${instance.id}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }

  return {
    totalBugs: 142, // Still mock
    totalPRs: totalPRs,
    fixedBugs: 115, // Still mock
  };
}

export async function getBugsData() {
  return [
    { week: "Week 1", bugs: 12, fixed: 8 },
    { week: "Week 2", bugs: 19, fixed: 12 },
    { week: "Week 3", bugs: 15, fixed: 14 },
    { week: "Week 4", bugs: 25, fixed: 18 },
    { week: "Week 5", bugs: 22, fixed: 20 },
    { week: "Week 6", bugs: 28, fixed: 24 },
    { week: "Week 7", bugs: 20, fixed: 19 },
  ];
}

export async function getBugTypesData() {
  return [
    { name: "Logic Errors", value: 35, color: "#10b981" },
    { name: "Type Issues", value: 25, color: "#34d399" },
    { name: "Security", value: 20, color: "#0ea5e9" },
    { name: "Performance", value: 15, color: "#06b6d4" },
    { name: "Other", value: 5, color: "#0d9488" },
  ];
}

export async function getRecentPRs() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error('Unauthorized');

    // 1. Get all instances for the user
    const instances = await prisma.instance.findMany({
      where: { userId: session.user.id },
    });

    const allPRs: any[] = [];

    // 2. Fetch PRs for each instance
    for (const instance of instances) {
      try {
        const envVars = await getDecryptedEnvVars(instance.id);
        
        if (envVars.GITHUB_TOKEN && envVars.GITHUB_REPO_OWNER && envVars.GITHUB_REPO_NAME) {
          const response = await fetch(
            `https://api.github.com/repos/${envVars.GITHUB_REPO_OWNER}/${envVars.GITHUB_REPO_NAME}/pulls?state=all&sort=updated&direction=desc&per_page=5`,
            {
              headers: {
                Authorization: `Bearer ${envVars.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
              },
              // Don't cache aggressively for PRs
              next: { revalidate: 60 }
            }
          );

          if (!response.ok) {
            console.error(`Failed to fetch PRs for ${instance.name}:`, await response.text());
            continue;
          }

          const prs = await response.json();
          
          const formattedPRs = prs.map((pr: any) => ({
            id: pr.id,
            title: pr.title,
            repo: envVars.GITHUB_REPO_NAME,
            status: pr.merged_at ? "merged" : (pr.state === "open" ? "pending" : "closed"),
            created: formatDistanceToNow(new Date(pr.updated_at), { addSuffix: true }),
            updatedAt: new Date(pr.updated_at).getTime(),
            url: pr.html_url
          }));

          allPRs.push(...formattedPRs);
        }
      } catch (err) {
        console.error(`Error processing instance ${instance.id} for PRs:`, err);
        // Continue to next instance
      }
    }

    // 3. Sort globally and return top 5
    allPRs.sort((a, b) => b.updatedAt - a.updatedAt);
    
    return allPRs.slice(0, 5);
  } catch (error) {
    console.error("Error fetching recent PRs:", error);
    return [];
  }
}

export async function saveInstancePrompt(instanceId: string, prompt: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Verify ownership
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId, userId: session.user.id },
    });

    if (!instance) {
      throw new Error('Instance not found or unauthorized');
    }

    await prisma.instanceConfig.upsert({
      where: { instanceId },
      update: { prompt },
      create: {
        instanceId,
        prompt,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error saving prompt:', error);
    return { success: false, error: error.message };
  }
}
