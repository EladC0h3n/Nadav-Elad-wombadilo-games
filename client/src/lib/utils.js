export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate (date) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Remove time part for comparison
  const messageDateString = messageDate.toDateString();
  const todayString = today.toDateString();
  const yesterdayString = yesterday.toDateString();

  if (messageDateString === todayString) return "Today";
  if (messageDateString === yesterdayString) return "Yesterday";
  return messageDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
};

  