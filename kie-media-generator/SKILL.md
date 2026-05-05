---
name: kie-media-generator
description: Generate images and videos using the KIE AI MCP server. Use this skill whenever the user wants to create, generate, or produce visual media — images, photos, illustrations, videos, animations, or motion graphics — even if they don't explicitly say "generate" or name a model. Also trigger for requests like "show me what X would look like", "create a visual of", "make a picture/video of", or any brand asset generation. The preferred models are Nano Banana 2 (images) and VEO 3 (videos), with automatic fallback to other KIE AI models when needed.
---

# KIE Media Generator

This skill generates images and videos through the KIE AI MCP server. It understands two primary workflows:

1. **Image generation** — produce still images from text prompts (with optional reference images)
2. **Video generation** — produce video clips, optionally with start/end frame images generated first

## Decision Flow

When a user requests media generation:

1. **Determine the type**: Is this an image or a video? If unclear, ask.
2. **Extract the creative brief**: What should the content depict? What style, mood, composition, aspect ratio, and resolution does the user want? Are there reference images?
3. **Generate** using the appropriate workflow below.
4. **Deliver**: Present the result (task ID, status) and offer to check on completion or make adjustments.

## Image Generation

### Default: Nano Banana 2 (`mcp__kie-ai__nano_banana_image`)

Use Nano Banana 2 as the primary image generation model. It supports up to 14 reference images, 4K output, and Google Search grounding for factual accuracy.

**Parameters to use:**
- `prompt`: The full creative brief (up to 5000 characters). Be descriptive — include style, composition, lighting, mood, and any text that should appear in the image.
- `aspect_ratio`: Match the user's request. Default to `16:9` for landscapes, `9:16` for portraits, `1:1` for squares. Full options: `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`, `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9`, `auto`.
- `resolution`: Default to `2K`. Use `4K` only when the user specifically requests high detail. Use `1K` for quick drafts or when speed matters.
- `image_input`: Provide reference image URLs here (up to 14) when the user supplies reference images or wants image editing.
- `google_search`: Set to `true` when the prompt involves real-world entities, landmarks, or factual content that benefits from web grounding.
- `output_format`: Default to `png`. Use `jpg` only if the user requests it or file size is a concern.

### When to use fallbacks

Switch to a fallback model when:
- The user explicitly requests a different model
- Nano Banana 2 fails or produces unsatisfactory results
- The user needs a capability specific to another model (e.g., Midjourney's stylization)

**Fallback order for images:**
1. **Flux 2** (`mcp__kie-ai__flux2_image`) — strong for photorealistic and stylized work; supports multi-reference consistency
2. **ByteDance Seedream V5 Lite** (`mcp__kie-ai__bytedance_seedream_image`) — excellent text rendering and multi-image fusion
3. **OpenAI GPT-4o** (`mcp__kie-ai__openai_4o_image`) — good for creative prompts, supports editing and variants
4. **Midjourney** (`mcp__kie-ai__midjourney_generate`) — best for artistic/stylized imagery
5. **Qwen** (`mcp__kie-ai__qwen_image`) — alternative with fine control over inference steps
6. **Z-Image** (`mcp__kie-ai__z_image`) — ultra-fast, good for drafts and iteration

Read `references/models.md` for detailed parameter guidance on each fallback model.

## Video Generation

### Core Workflow

Video generation follows a structured pipeline because VEO 3 produces the best results when given explicit start and end frames.

**Step 1 — Gather or generate frames:**

- If the user provides start and/or end frame images, use those directly.
- If the user does NOT provide frame images, **generate them first** using Nano Banana 2 (the image generation workflow above):
  - Generate a **start frame** — the opening shot of the video
  - Generate an **end frame** — the closing shot of the video
  - Both frames should share consistent style, lighting, and composition so the video transitions smoothly between them
  - When generating frames, craft prompts that describe a specific moment in time (not a motion), and include visual details like camera angle, lighting, and color grading

**Step 2 — Compose the video prompt:**

The prompt for VEO 3 should describe:
- The overall scene and motion
- Camera movement (pan, zoom, dolly, static, etc.)
- Transitions between start and end frames
- **Audio/sound descriptions** — include what sounds should be present (ambient noise, music style, dialogue, sound effects). VEO 3 can generate native audio, so be specific about the soundscape.

**Step 3 — Generate the video** using VEO 3 (`mcp__kie-ai__veo3_generate_video`):

- `prompt`: The composed video prompt with motion and audio descriptions
- `imageUrls`: Array with 1 or 2 URLs — 1 image for start frame only, 2 images for start + end frames
- `model`: Default to `veo3`. Use `veo3_fast` when speed matters more than quality.
- `aspectRatio`: Match the user's request. Default to `16:9`. Options: `16:9`, `9:16`, `Auto`.
- `enableFallback`: Set to `true` to allow fallback if VEO 3 has a content policy issue.
- `enableTranslation`: Set to `true` if the prompt is not in English.

**Step 4 — Check task status** using `mcp__kie-ai__get_task_status`:

Video generation is asynchronous. After calling VEO 3, check the task status until it completes.

**Step 5 — Upgrade to 1080p** (optional):

If the video was generated with the `veo3` model (not `veo3_fast`) and the user wants higher resolution, use `mcp__kie-ai__veo3_get_1080p_video` with the task ID.

### When to use fallbacks

Switch to a fallback video model when:
- The user explicitly requests a different model
- VEO 3 fails or is unavailable
- The user needs a capability specific to another model (e.g., longer duration, specific aspect ratios)

**Fallback order for videos:**
1. **Kling 3.0** (`mcp__kie-ai__kling_video`) — supports 3-15s duration, native multilingual audio, multi-shot storytelling, character elements for consistency
2. **Sora 2** (`mcp__kie-ai__sora_video`) — OpenAI's model, supports storyboarding and image-to-video
3. **Hailuo** (`mcp__kie-ai__hailuo_video`) — good quality with v2.3, 1080P support
4. **ByteDance Seedance 2.0** (`mcp__kie-ai__bytedance_seedance_video`) — multimodal inputs, native audio
5. **Wan 2.5** (`mcp__kie-ai__wan_video`) — fast, good for iterative workflows

Read `references/models.md` for detailed parameter guidance on each fallback model.

## Image Upscaling & Enhancement

If the user wants to upscale or enhance an existing image (rather than generate a new one), use `mcp__kie-ai__topaz_upscale_image` for up to 8x resolution increase.

If the user wants to remove a background, use `mcp__kie-ai__recraft_remove_background`.

## Image Reframing

To change the aspect ratio of an existing image without regenerating it, use `mcp__kie-ai__ideogram_reframe`.

## General Guidelines

### Crafting effective prompts

- Be specific and descriptive — the more detail, the better the output
- Include style references (e.g., "cinematic", "watercolor", "photorealistic")
- Specify lighting, mood, and color grading
- For images with text, spell out the exact text and describe its placement
- For videos, describe motion direction, speed, and camera movement
- Include audio descriptions for videos (ambient sounds, music, dialogue)

### Handling failures

- If a model call fails, try the next fallback in the order listed
- If content policy blocks a request, simplify the prompt and remove potentially problematic terms
- If all models fail, report the issue to the user with the error details

### Consistency across frames

When generating start and end frames for video:
- Use the same style keywords in both prompts
- Match lighting conditions (time of day, direction, color temperature)
- Keep the same camera angle and perspective
- Only change the subject's position, expression, or the scene's progression
- Include a shared "style seed" — a consistent set of style descriptors used in both prompts