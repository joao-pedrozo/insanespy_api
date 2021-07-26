const ONE_SECOND_IN_MILLISECONDS = 1000;
const ONE_DAY_IN_MILLISECONDS = ONE_SECOND_IN_MILLISECONDS * 60 * 60 * 24;

function parseDate(date: Date | string) {
  const usableDate = typeof date === "string" ? new Date(date) : date;
  return usableDate;
}

function formatDate(date: Date | string) {
  const parsedDate = parseDate(date);

  return `${
    parsedDate.getDate().toString().length === 1
      ? `0${parsedDate.getDate()}`
      : parsedDate.getDate()
  }/${
    (parsedDate.getMonth() + 1).toString.length === 1
      ? `0${parsedDate.getMonth() + 1}`
      : parsedDate.getMonth() + 1
  }/${parsedDate.getFullYear()} ${
    parsedDate.getHours().toString().length === 1
      ? `0${parsedDate.getHours()}`
      : parsedDate.getHours()
  }:${
    parsedDate.getMinutes().toString().length === 1
      ? `0${parsedDate.getMinutes()}`
      : parsedDate.getMinutes()
  }`;
}

function hasPassedOneDay(date: Date) {
  const parsedDate = parseDate(date);
  const differenceBetweenDates =
    new Date().getTime() - parsedDate.getTime() > ONE_DAY_IN_MILLISECONDS;

  return differenceBetweenDates;
}

function hasPassedXDays(date: Date, days: number) {
  const parsedDate = parseDate(date);

  const differenceBetweenDates =
    new Date().getTime() - parsedDate.getTime() >
    ONE_DAY_IN_MILLISECONDS * days;

  return differenceBetweenDates;
}

export { formatDate, hasPassedOneDay, parseDate, hasPassedXDays };
