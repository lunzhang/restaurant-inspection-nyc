$(document).ready(() => {
  let savedRestaurants = [];
  const $input = $('#restaurant-das');
  const $searchBtn = $('#search-btn');
  const $restaurantList = $('#restaurant-list');
  const $savedRestaurantList = $('#saved-restaurant-list');

  const buildRestaurantList = (restaurant, element) => {
    element.append(`
      <tr>
        <td scope="row"> ${restaurant.dba} </td>
        <td> ${restaurant.address} </td>
        <td> ${restaurant.inspection_date} </td>
        <td> ${restaurant.grade} </td>
      </tr>`
    );
  };

  const sortViolations = (a, b) => {
    if (a.inspection_date < b.inspection_date)
     return 1;
   if (a.inspection_date > b.inspection_date)
     return -1;
   return 0;
  }

  const extractAddress = (violation) => {
    return `${violation.building} ${violation.street} ${violation.boro}, ${violation.zipcode}`;
  };

  const search = () => {
    $restaurantList.empty();
    const term = $input.val();
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
              inspection_date: violation.inspection_date.slice(0, violation.inspection_date.indexOf('T')),
              phone: violation.phone,
              grade: violation.grade,
              violations: [violation]
            };
          }
        });
        Object.keys(restaurants).map(key => {
          const restaurant = restaurants[key];
          buildRestaurantList(restaurant, $restaurantList);
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
            inspection_date: latestViolation.inspection_date.slice(0, latestViolation.inspection_date.indexOf('T')),
            phone: latestViolation.phone,
            grade: latestViolation.grade,
          };
          buildRestaurantList(restaurant, $savedRestaurantList);
        }
      });
    });
  });
  $searchBtn.bind('click', search);
});
