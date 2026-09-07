"""Qwen2.5-0.5B-Instruct tune model - OpenAI-compatible endpoint on Modal.

Serves https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct via vLLM's built-in
OpenAI-compatible API server, so the app can call it with any OpenAI-style
client (see src/lib/ai/config.ts).

Modal secret: create it once (or when the key rotates):
  modal secret create qwen-tune-api-key QWEN_TUNE_API_KEY=<random-string>

Local test (from repo root):
  modal serve modal/qwen_tune.py
  curl http://localhost:8000/v1/chat/completions \
    -H "Authorization: Bearer <QWEN_TUNE_API_KEY>" \
    -H "Content-Type: application/json" \
    -d '{"model": "qwen2.5-0.5b-instruct", "messages": [{"role": "user", "content": "Xin chao"}]}'

Deploy:
  modal deploy modal/qwen_tune.py
"""

import modal

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"
MODEL_REVISION = "7ae557604adf67be50417f59c2c2f167def9a775"
VLLM_PORT = 8000
CACHE_DIR = "/cache"

hf_cache_volume = modal.Volume.from_name("prose-tune-hf-cache", create_if_missing=True)
vllm_cache_volume = modal.Volume.from_name(
    "prose-tune-vllm-cache", create_if_missing=True
)

image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "vllm==0.9.1",
        "huggingface_hub[hf_transfer]>=0.32.0",
    )
    .env(
        {
            "HF_HUB_ENABLE_HF_TRANSFER": "1",
            "HF_HOME": CACHE_DIR,
            "VLLM_CACHE_ROOT": "/vllm-cache",
        }
    )
)

app = modal.App("prose-tune-qwen", image=image)


@app.function(
    gpu="t4",
    max_containers=1,
    scaledown_window=60 * 5,
    timeout=60 * 10,
    secrets=[modal.Secret.from_name("qwen-tune-api-key")],
    volumes={CACHE_DIR: hf_cache_volume, "/vllm-cache": vllm_cache_volume},
)
@modal.concurrent(max_inputs=32)
@modal.web_server(port=VLLM_PORT, startup_timeout=5 * 60)
def serve():
    import os
    import subprocess

    api_key = os.environ["QWEN_TUNE_API_KEY"]

    subprocess.Popen(
        [
            "python",
            "-m",
            "vllm.entrypoints.openai.api_server",
            "--model",
            MODEL_NAME,
            "--revision",
            MODEL_REVISION,
            "--served-model-name",
            "qwen2.5-0.5b-instruct",
            "--host",
            "0.0.0.0",
            "--port",
            str(VLLM_PORT),
            "--api-key",
            api_key,
            "--max-model-len",
            "8192",
        ]
    )
