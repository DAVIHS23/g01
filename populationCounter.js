var femaleCounter = 0;
var maleCounter = 0;
var totalCounter = 0;

function updateGenderCounters(data, year, selectedCountry) {
  var filteredData = data.filter(d => d.year === year && (!selectedCountry || d.country === selectedCountry));

  femaleCounter = 0;
  maleCounter = 0;
  totalCounter = 0;

  filteredData.forEach(d => {
    femaleCounter += d.femalePopulation || 0;
    maleCounter += d.malePopulation || 0;
    totalCounter += d.population || 0;
  });

  document.getElementById('femaleCounter').querySelector('span').innerText = femaleCounter.toLocaleString('de-DE');
  document.getElementById('maleCounter').querySelector('span').innerText = maleCounter.toLocaleString('de-DE');
  document.getElementById('totalCounter').querySelector('span').innerText = totalCounter.toLocaleString('de-DE');
}
