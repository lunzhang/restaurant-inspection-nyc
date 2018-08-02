let savedRestaurants = [];

const buildRestaurantList = (restaurants, element) => {
  restaurants.forEach(restaurant => {
    element.append(`
    <div>
      ${restaurant}
    </div>`);
  });
};

const sortViolations = (a, b) => {
  if (a.inspection_date < b.inspection_date)
   return 1;
 if (a.inspection_date > b.inspection_date)
   return -1;
 return 0;
}

const extractAddress = (violation) => {
  return '';
};

const search = (term) => {
  $.ajax({
    url: `https://data.cityofnewyork.us/resource/9w7m-hzhe.json?$where=DBA%20like%20%27%25${term.toUpperCase()}%25%27`,
    success: function (violations) {
      violations.sort(sortViolations);
      const restaurants = { };
      violations.forEach(violation => {
        if (restaurants[violation.camis]) {
          restaurants[violation.camis].violations.push(violation);
        } else {
          restaurants[violation.camis] = {
            camis: violation.camis,
            dba: violation.dba,
            address: extractAddress(violation),
            cuisine_description: violation.cuisine_description,
            phone_number: violation.phone,
            grade: violation.grade,
            violations: [violation]
          };
        }
      });
    }
  });
};

chrome.storage.local.get(['restaurants'], function(result) {
  savedRestaurants = result.key ? result.key : [41541793];
  savedRestaurants.forEach(id => {
    $.ajax({
      url: `https://data.cityofnewyork.us/resource/9w7m-hzhe.json?camis=${id}`,
      success: function (violations) {
        violations.sort(sortViolations);
        const latestViolation = violations[0];
        const restaurant = {
          violations,
          camis: latestViolation.camis,
          dba: latestViolation.dba,
          address: extractAddress(latestViolation),
          cuisine_description: latestViolation.cuisine_description,
          phone_number: latestViolation.phone,
          grade: latestViolation.grade,
        };
      }
    });
  });
});

search("sophie");
