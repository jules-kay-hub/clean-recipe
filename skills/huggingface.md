# Hugging Face Integration Skills

**Plugin:** `huggingface-skills`

## Available Skills

### hugging-face-cli
**Invoke:** Use for Hub CLI operations

Execute Hugging Face Hub operations using the `hf` CLI.

**Capabilities:**
- Download models/datasets/spaces
- Upload files to Hub repositories
- Create repos
- Manage local cache
- Run compute jobs

### hugging-face-datasets
**Invoke:** Use for dataset management

Create and manage datasets on Hugging Face Hub.

**Capabilities:**
- Initialize repos
- Define configs/system prompts
- Stream row updates
- SQL-based querying/transformation

### hugging-face-evaluation
**Invoke:** Use for model evaluation

Add and manage evaluation results in Hugging Face model cards.

**Capabilities:**
- Extract eval tables from README
- Import scores from Artificial Analysis API
- Run custom model evaluations with vLLM/lighteval
- Update model-index metadata

### hugging-face-jobs
**Invoke:** Use for running workloads

Run any workload on Hugging Face Jobs infrastructure.

**Use When:**
- Running cloud compute/GPU workloads
- Data processing and batch jobs
- Inference experiments
- Python-based tasks without local setup

**Covers:**
- UV scripts
- Docker-based jobs
- Hardware selection
- Cost estimation
- Secrets management

### hugging-face-model-trainer
**Invoke:** Use for model training

Train or fine-tune language models using TRL on HF Jobs.

**Training Methods:**
- SFT (Supervised Fine-Tuning)
- DPO (Direct Preference Optimization)
- GRPO
- Reward modeling

**Also Covers:**
- GGUF conversion for local deployment
- Dataset preparation
- Hardware/cost estimation
- Trackio monitoring

### hugging-face-paper-publisher
**Invoke:** Use for research publishing

Publish and manage research papers on Hugging Face Hub.

**Capabilities:**
- Create paper pages
- Link papers to models/datasets
- Claim authorship
- Generate markdown research articles

### hugging-face-tool-builder
**Invoke:** Use for building tools

Build tools/scripts using Hugging Face API data.

**Use When:**
- Chaining or combining API calls
- Creating reusable scripts
- Automating tasks with HF data

## Common Workflows

### Download a Model
```
Use hugging-face-cli to download meta-llama/Llama-2-7b
```

### Fine-Tune a Model
```
Use hugging-face-model-trainer to fine-tune on my dataset
```

### Run GPU Workload
```
Use hugging-face-jobs to run my training script on A100
```

### Create Dataset
```
Use hugging-face-datasets to create a new dataset from my CSV
```

## Prerequisites

- Hugging Face account
- HF CLI installed (`pip install huggingface_hub`)
- HF token configured (`huggingface-cli login`)

## Hardware Options

| Hardware | Use Case |
|----------|----------|
| CPU | Small tasks, inference |
| T4 | Basic training, inference |
| A10G | Medium training |
| A100 | Large model training |

## Best Practices

1. **Token Management** - Use `HF_TOKEN` environment variable
2. **Cache Management** - Clean cache periodically
3. **Cost Awareness** - Estimate costs before GPU jobs
4. **Model Cards** - Always include good documentation
5. **Licensing** - Check model licenses before use
