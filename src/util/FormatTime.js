export const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Add leading zero if minutes is less than 10
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${formattedMinutes}`;
  };
