export function formatDate(date) {
  let formattedDate = new Date(date).toLocaleDateString();
  return formattedDate;
}
