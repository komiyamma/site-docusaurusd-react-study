
import os

file_path = r"g:\repogitory\react_study_roadmap\picture\image_generation_plan.md"

new_content = """

## Chapter 082: React.memo Barrier
- **File**: `react_study_082_memo_barrier.png`
- **Section**: `## 82-8 🧭 Mermaid 図でイメージしてみよう`
- **Prompt**: A security barrier labeled "React.memo". Props are passengers. If passengers match the previous ones, the barrier stays down (Skip Render). If they are different, barrier lifts. Target Audience: Japanese learners. Text/Labels: Use ENGLISH for code terms. Use JAPANESE for concepts. Do NOT render the text 'Target Audience'. Style: Modern Flat Vector (Clean Line Art).
- **Status**: [ ] 未生成

## Chapter 140: Immer Draft Magic
- **File**: `react_study_140_immer_draft_magic.png`
- **Section**: `## 5️⃣ useImmer のイメージ図 🧠💭`
- **Prompt**: A writer working on a 'Draft' copy of a document. The original is sealed in glass (Immutable). When finished, the draft becomes the new Original. 'Immer' magic. Target Audience: Japanese learners. Text/Labels: Use ENGLISH for code terms. Use JAPANESE for concepts. Do NOT render the text 'Target Audience'. Style: Modern Flat Vector (Clean Line Art).
- **Status**: [ ] 未生成

## Chapter 250: Time Travel Stacks
- **File**: `react_study_250_time_travel_stacks.png`
- **Section**: `## どんな仕組み？（ざっくり図解）🧠🗺️`
- **Prompt**: Three stacks of blocks. Left: 'Past'. Center: 'Current'. Right: 'Future'. An arrow moves a block from Past to Current (Undo). One moves Current to Future (Redo). 'Jotai Time Master'. Target Audience: Japanese learners. Text/Labels: Use ENGLISH for code terms. Use JAPANESE for concepts. Do NOT render the text 'Target Audience'. Style: Modern Flat Vector (Clean Line Art).
- **Status**: [ ] 未生成

## Chapter 260: Valibot Schema Filter
- **File**: `react_study_260_valibot_schema_filter.png`
- **Section**: `## Chapter 260`
- **Prompt**: A robot (Valibot) inspecting shape blocks. A square block passes through a square hole (Schema). A round block is rejected. 'Validation Success'. Target Audience: Japanese learners. Text/Labels: Use ENGLISH for code terms. Use JAPANESE for concepts. Do NOT render the text 'Target Audience'. Style: Modern Flat Vector (Clean Line Art).
- **Status**: [ ] 未生成

## Chapter 290: SSE Streaming Flow
- **File**: `react_study_290_sse_streaming_concept.png`
- **Section**: `## 2) 全体のしくみ（図解）🗺️`
- **Prompt**: A faucet labeled 'AI' pouring letters/water into a cup labeled 'React Client'. The water flows continuously, not in chunks. 'Stream' concept. Target Audience: Japanese learners. Text/Labels: Use ENGLISH for code terms. Use JAPANESE for concepts. Do NOT render the text 'Target Audience'. Style: Modern Flat Vector (Clean Line Art).
- **Status**: [ ] 未生成
"""

with open(file_path, 'a', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully appended new entries to image_generation_plan.md")
