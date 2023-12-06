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

  document.getElementById('totalCounter').querySelector('span').innerText = totalCounter.toLocaleString('de-DE');

  var femaleCountSpan = document.getElementById('femaleCounter').querySelector('span');
  femaleCountSpan.innerText = femaleCounter.toLocaleString('de-DE');
  
  var femalePercentSpan = document.getElementById('femaleCounter').querySelector('#female-count-percent');
  var femalePercentage = (femaleCounter / totalCounter * 100).toFixed(2) + '%';
  femalePercentSpan.innerText = femalePercentage;

  var maleCountSpan = document.getElementById('maleCounter').querySelector('span');
  maleCountSpan.innerText = maleCounter.toLocaleString('de-DE');
  
  var malePercentSpan = document.getElementById('maleCounter').querySelector('#male-count-percent');
  var malePercentage = (maleCounter / totalCounter * 100).toFixed(2) + '%';
  malePercentSpan.innerText = malePercentage;
}