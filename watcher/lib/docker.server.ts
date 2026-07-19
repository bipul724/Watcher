// watcher/lib/docker.server.ts
import "server-only";

export async function getDocker() {
  const Docker = (await import("dockerode")).default;

  return new Docker({
    socketPath: "/var/run/docker.sock",
  });
}