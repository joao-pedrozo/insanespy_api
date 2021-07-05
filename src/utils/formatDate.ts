function formatDate(date: Date) {
  return `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
}

export default formatDate;
