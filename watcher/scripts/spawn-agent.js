import Docker from "dockerode";

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

async function run() {
  const env = JSON.parse(process.argv[2]);

  const envArray = Object.entries(env).map(
    ([k, v]) => `${k}=${v}`
  );

  const container = await docker.createContainer({
    Image: "watcherai-image",
    Env: envArray,
    name: `agent_${env.USER_ID}_${env.JOB_ID}`,
    HostConfig: {
      Memory: 512 * 1024 * 1024,
      NanoCPUs: 500000000,
      AutoRemove: false,
    },
    NetworkingConfig: {
  EndpointsConfig: {
    docker_default: {}, // 🔥 VERY IMPORTANT
  },
},
  });

  await container.start();

  console.log("Started:", container.id);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});