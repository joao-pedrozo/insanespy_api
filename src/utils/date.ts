function parseDate(date: Date | string) {
  const usableDate = typeof date === "string" ? new Date(date) : date;
  return usableDate;
}

function formatDate(date: Date | string) {
  const parsedDate = parseDate(date);

  return `${parsedDate.getDate()}/${
    parsedDate.getMonth() + 1
  }/${parsedDate.getFullYear()} ${parsedDate.getHours()}:${parsedDate.getMinutes()}`;
}

function hasPassedOneDay(date: Date) {
  const parsedDate = parseDate(date);
  const differenceBetweenDates =
    new Date().getTime() - parsedDate.getTime() > 86400000;

  return differenceBetweenDates;
}

export { formatDate, hasPassedOneDay, parseDate };
