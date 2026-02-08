export function calculateReadTime(content) {
  if (!content || !content.blocks) return "1 min read";

  let totalWords = 0;

  content.blocks.forEach((block) => {
    if (block.data?.text) {
      const text = block.data.text.replace(/<[^>]+>/g, "");
      totalWords += text.trim().split(/\s+/).length;
    }

    if (block.type === "list" && block.data?.items) {
      block.data.items.forEach((item) => {
        const text = item.replace(/<[^>]+>/g, "");
        totalWords += text.trim().split(/\s+/).length;
      });
    }
  });

  if (totalWords < 80) return "Less than 1 min read";

  const minutes = Math.ceil(totalWords / 200);

  return `${minutes} min read`;
}
