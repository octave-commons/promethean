import asyncio
import argparse
import time
import websockets


async def run_benchmark(host, port, text, iterations):
    uri = f"ws://{host}:{port}/ws/tts"
    latencies = []
    async with websockets.connect(uri) as ws:
        for _ in range(iterations):
            start = time.perf_counter()
            await ws.send(text)
            await ws.recv()
            latencies.append(time.perf_counter() - start)
    avg = sum(latencies) / len(latencies)
    print(f"Average latency over {iterations} runs: {avg:.3f}s")


def main():
    parser = argparse.ArgumentParser(description="Benchmark TTS WebSocket service")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=5004)
    parser.add_argument("--text", default="hello world")
    parser.add_argument("-n", "--iterations", type=int, default=10)
    args = parser.parse_args()
    asyncio.run(run_benchmark(args.host, args.port, args.text, args.iterations))


if __name__ == "__main__":
    main()
