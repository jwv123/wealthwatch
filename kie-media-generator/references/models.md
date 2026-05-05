# KIE AI Model Reference

Detailed parameter guidance for each model available through the KIE AI MCP server.

## Table of Contents

- [Image Models](#image-models)
  - [Nano Banana 2 (Default)](#nano-banana-2-default)
  - [Flux 2](#flux-2)
  - [ByteDance Seedream](#bytedance-seedream)
  - [OpenAI GPT-4o](#openai-gpt-4o)
  - [Midjourney](#midjourney)
  - [Qwen](#qwen)
  - [Z-Image](#z-image)
- [Video Models](#video-models)
  - [VEO 3 (Default)](#veo-3-default)
  - [Kling 3.0](#kling-30)
  - [Sora 2](#sora-2)
  - [Hailuo](#hailuo)
  - [ByteDance Seedance 2.0](#bytedance-seedance-20)
  - [Wan 2.5](#wan-25)
- [Utility Models](#utility-models)
  - [Topaz Upscale](#topaz-upscale)
  - [Recraft Background Removal](#recraft-background-removal)
  - [Ideogram Reframe](#ideogram-reframe)

---

## Image Models

### Nano Banana 2 (Default)

**Tool:** `mcp__kie-ai__nano_banana_image`

Google Gemini 3.1 Flash Image. Best general-purpose image generator. Supports up to 14 reference images, 4K output, Google Search grounding, and clear text rendering.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 5000 chars | Be descriptive |
| `image_input` | up to 14 URLs | For editing/fusion |
| `aspect_ratio` | `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`, `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9`, `auto` | Default: `16:9` |
| `resolution` | `1K`, `2K`, `4K` | Default: `2K` |
| `output_format` | `png`, `jpg` | Default: `png` |
| `google_search` | `true`/`false` | Enable for factual/real-world content |

### Flux 2

**Tool:** `mcp__kie-ai__flux2_image`

Black Forest Labs Flux 2. Strong for photorealistic and stylized work. Multi-reference consistency support.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | 3-5000 chars | Descriptive text |
| `input_urls` | 1-8 URLs | Reference images for img2img |
| `aspect_ratio` | `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `3:2`, `2:3`, `auto` | Default: match content |
| `resolution` | `1K`, `2K` | Pro: 1K/2K, Flex: 1K/2K |
| `model_type` | `pro`, `flex` | Pro for fast/reliable, Flex for more control |

### ByteDance Seedream

**Tool:** `mcp__kie-ai__bytedance_seedream_image`

ByteDance Seedream. V5 Lite offers enhanced detail, multi-image fusion (up to 14 refs), and clear small-text rendering.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 5000 chars | Descriptive text |
| `image_urls` | up to 10 (V4) or 14 (V5 Lite) | For editing |
| `version` | `4`, `5-lite` | Default: `5-lite` |
| `aspect_ratio` | `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `2:3`, `3:2`, `21:9` | V5 Lite only |
| `image_size` | various | V4 only |
| `image_resolution` | `1K`, `2K`, `4K` | V4 only |
| `quality` | `basic`, `high` | V5 Lite: basic=2K, high=3K |

### OpenAI GPT-4o

**Tool:** `mcp__kie-ai__openai_4o_image`

OpenAI's GPT-4o image generation. Good for creative prompts, supports editing and variants.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 5000 chars | Descriptive text |
| `filesUrl` | up to 5 URLs | For editing/variants |
| `maskUrl` | 1 URL | Mask for precise editing |
| `size` | `1:1`, `3:2`, `2:3` | |
| `nVariants` | `1`, `2`, `4` | Number of variations |
| `isEnhance` | `true`/`false` | Enable for 3D renders etc. |
| `enableFallback` | `true`/`false` | Fall back to backup models |
| `fallbackModel` | `GPT_IMAGE_1`, `FLUX_MAX` | Which backup to use |

### Midjourney

**Tool:** `mcp__kie-ai__midjourney_generate`

Midjourney AI. Best for artistic and stylized imagery.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 2000 chars | Descriptive text |
| `taskType` | `mj_txt2img`, `mj_img2img`, `mj_style_reference`, `mj_omni_reference`, `mj_video`, `mj_video_hd` | |
| `fileUrls` | array of URLs | For img2img/video |
| `aspectRatio` | `1:2`, `9:16`, `2:3`, `3:4`, `5:6`, `6:5`, `4:3`, `3:2`, `1:1`, `16:9`, `2:1` | |
| `version` | `7`, `6.1`, `6`, `5.2`, `5.1`, `niji6` | Default: `7` |
| `stylization` | 0-1000 (step 50) | Artistic intensity |
| `variety` | 0-100 (step 5) | Output diversity |
| `weirdness` | 0-3000 (step 100) | Creativity level |
| `speed` | `relaxed`, `fast`, `turbo` | |

### Qwen

**Tool:** `mcp__kie-ai__qwen_image`

Qwen image model. Good fine control over inference parameters.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 500 chars | Shorter prompt limit |
| `image_url` | 1 URL | For editing |
| `image_size` | `square`, `square_hd`, `portrait_4_3`, `portrait_16_9`, `landscape_4_3`, `landscape_16_9` | |
| `guidance_scale` | 0-20 | Default: 2.5 (txt2img), 4 (edit) |
| `num_inference_steps` | 2-250 (txt2img), 2-49 (edit) | |
| `num_images` | `1`, `2`, `3`, `4` | Edit mode only |
| `negative_prompt` | max 500 chars | What to avoid |
| `seed` | integer | Reproducibility |

### Z-Image

**Tool:** `mcp__kie-ai__z_image`

Tongyi-MAI Z-Image. Ultra-fast (~$0.004/image). Good for drafts and iteration.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 5000 chars | Supports bilingual (Chinese/English) |
| `aspect_ratio` | `1:1`, `4:3`, `3:4`, `16:9`, `9:16` | |

---

## Video Models

### VEO 3 (Default)

**Tool:** `mcp__kie-ai__veo3_generate_video`

Google's VEO 3. Highest quality video generation with native audio support. Works best with start and end frame images.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | free text | Include motion + audio descriptions |
| `imageUrls` | 0-2 URLs | 1=start frame, 2=start+end frames |
| `model` | `veo3`, `veo3_fast` | Default: `veo3` |
| `aspectRatio` | `16:9`, `9:16`, `Auto` | Default: `16:9` |
| `seeds` | integer | For reproducibility |
| `enableFallback` | `true`/`false` | Allow fallback on policy issues |
| `enableTranslation` | `true`/`false` | Auto-translate non-English prompts |
| `watermark` | string | Optional watermark text |

**1080P upgrade:** Use `mcp__kie-ai__veo3_get_1080p_video` with the task ID after generation completes. Not available for fallback videos.

### Kling 3.0

**Tool:** `mcp__kie-ai__kling_video`

Kuaishou Kling 3.0. Supports 3-15s duration, native multilingual audio, multi-shot storytelling, and character elements for consistency.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 5000 chars | For audio use [Name, voice style] format |
| `image_urls` | up to 2 | First=start, second=end frame |
| `duration` | `3`-`15` seconds | |
| `aspect_ratio` | `16:9`, `9:16`, `1:1` | Text-to-video only |
| `mode` | `std`, `pro` | Standard=faster, Pro=higher quality |
| `sound` | `true`/`false` | Enable native audio (2x credits) |
| `multi_shots` | `true`/`false` | Multi-shot cinematic mode |
| `multi_prompt` | array of `{prompt, duration}` | Shot definitions |
| `kling_elements` | array of element objects | Character consistency across shots |

### Sora 2

**Tool:** `mcp__kie-ai__sora_video`

OpenAI's Sora 2. Supports storyboarding, image-to-video, and multiple durations.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 5000 chars | Descriptive text |
| `image_urls` | 1-10 URLs | For img2vid or storyboard |
| `aspect_ratio` | `portrait`, `landscape` | |
| `n_frames` | `10`, `15`, `25` | Duration: 10s/15s/25s at 5fps |
| `size` | `standard` (480p), `high` (1080p) | |
| `remove_watermark` | `true`/`false` | |

### Hailuo

**Tool:** `mcp__kie-ai__hailuo_video`

Hailuo AI. v2.3 offers enhanced motion, expressions, and 1080P support.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 1500 chars | |
| `imageUrl` | 1 URL | Start frame for img2vid |
| `endImageUrl` | 1 URL | End frame (requires imageUrl) |
| `version` | `02`, `2.3` | Default: `2.3` |
| `quality` | `standard`, `pro` | |
| `duration` | `6`, `10` | Standard quality only |
| `resolution` | `512P`, `768P`, `1080P` | Standard quality: 512P/768P, v2.3: 768P/1080P |
| `promptOptimizer` | `true`/`false` | Let model optimize prompt |

### ByteDance Seedance 2.0

**Tool:** `mcp__kie-ai__bytedance_seedance_video`

ByteDance Seedance 2.0. Multimodal inputs (image/video/audio references), native audio generation.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | 3-20000 chars | Very long prompt support |
| `first_frame_url` | 1 URL | Start frame |
| `last_frame_url` | 1 URL | End frame |
| `reference_image_urls` | up to 9 | Style/subject guidance |
| `reference_video_urls` | up to 3 | Motion/style guidance |
| `reference_audio_urls` | up to 3 | Sound-guided generation |
| `aspect_ratio` | `1:1`, `9:16`, `16:9`, `4:3`, `3:4`, `21:9`, `9:21`, `adaptive` | |
| `resolution` | `480p`, `720p` | |
| `duration` | 4-15 seconds | |
| `mode` | `standard`, `fast` | standard=seedance-2, fast=seedance-2-fast |
| `generate_audio` | `true`/`false` | Native audio |
| `nsfw_checker` | `true`/`false` | Content filtering |
| `web_search` | `true`/`false` | Enhance prompt understanding |

### Wan 2.5

**Tool:** `mcp__kie-ai__wan_video`

Alibaba Wan 2.5. Fast generation, good for iterative workflows.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `prompt` | max 800 chars | |
| `image_url` | 1 URL | For img2vid |
| `aspect_ratio` | `16:9`, `9:16`, `1:1` | Text-to-video only |
| `resolution` | `720p`, `1080p` | |
| `duration` | `5`, `10` | Img2vid only |
| `negative_prompt` | max 500 chars | |
| `enable_prompt_expansion` | `true`/`false` | LLM prompt rewriting |
| `seed` | integer | Reproducibility |

---

## Utility Models

### Topaz Upscale

**Tool:** `mcp__kie-ai__topaz_upscale_image`

Upscale and enhance existing images up to 8x (max output 20,000px per side).

| Parameter | Values | Notes |
|-----------|--------|-------|
| `image_url` | 1 URL | Required |
| `upscale_factor` | `1`, `2`, `4`, `8` | 1=enhance only |

### Recraft Background Removal

**Tool:** `mcp__kie-ai__recraft_remove_background`

Remove backgrounds from images (PNG, JPG, WEBP, max 5MB, 16MP, 4096px max, 256px min).

| Parameter | Values | Notes |
|-----------|--------|-------|
| `image` | 1 URL | Required |

### Ideogram Reframe

**Tool:** `mcp__kie-ai__ideogram_reframe`

Change aspect ratio of existing images without regenerating.

| Parameter | Values | Notes |
|-----------|--------|-------|
| `image_url` | 1 URL | Required |
| `image_size` | various sizes | Output dimensions |
| `style` | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` | |
| `num_images` | `1`-`4` | |
| `rendering_speed` | `TURBO`, `BALANCED`, `QUALITY` | |
| `seed` | integer | |