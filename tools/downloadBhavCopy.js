async function downloadBhavcopy(days) {
  const baseUrl = 'https://www.nseindia.com/api/reports';
  // const archiveParam = encodeURIComponent(
  //   '[{"name":"CM-UDiFF Common Bhavcopy Final (zip)","type":"daily-reports","category":"capital-market","section":"equities"}]'
  // );
  const archiveParameter = encodeURIComponent(
    '[{"name":"CM - Bhavcopy(csv)","type":"archives","category":"capital-market","section":"equities"}]'
  );
  let count = 0;
  // let currentDate = new Date();
  let currentDate = new Date(2023, 11, 31);

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function getFileName(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  while (count < days) {
    // Check if current date is a weekday (Monday-Friday)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const formattedDate = formatDate(currentDate);
      const fileName = getFileName(currentDate);
      const url = `${baseUrl}?archives=${archiveParameter}&date=${formattedDate}&type=equities&mode=single`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = globalThis.URL.createObjectURL(blob);
          link.download = `${fileName}.zip`;
          link.click();
          globalThis.URL.revokeObjectURL(link.href);
          console.log(`Downloaded: [${count}/${days}] ${fileName}.zip`);
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          console.log(`Failed to download for date: ${fileName}`);
        }
        count++;
      } catch (error) {
        console.error(`Error downloading for date: ${fileName}`, error);
      }
    }
    // Move to the previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }
}

// Start downloading last 1 year of Bhavcopy
downloadBhavcopy(3000);
