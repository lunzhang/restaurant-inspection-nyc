const browserStorage = chrome.storage || storage;

$(document).ready(() => {
  let savedRestaurants = [];
  const $input = $('#restaurant-das');
  const $searchBtn = $('#search-btn');
  const $restaurantList = $('#restaurant-list');
  const $savedRestaurantList = $('#saved-restaurant-list');

  const saveRestaurant = (restaurant) => {
    if (savedRestaurants.indexOf(restaurant.camis) === -1) {
      savedRestaurants.push(restaurant.camis);
      buildRestaurantList(restaurant, $savedRestaurantList);
      browserStorage.local.set({'restaurants': savedRestaurants});
    }
  };

  const removeRestaurant = (restaurant) => {
    const restaurantId = restaurant.camis;
    $savedRestaurantList.find(`#${restaurantId}`).remove();
    $savedRestaurantList.find(`.Delete${restaurantId}`).remove();
    savedRestaurants.splice(savedRestaurants.indexOf(restaurantId), 1);
    browserStorage.local.set({'restaurants': savedRestaurants});
  };

  const gradePoints = function (points) {
    if (points <= 13)
      return 'Estimated A';
    else if (points <= 27)
      return 'Estimated B';
    else if (points > 27)
      return 'Estimated C';
    else
      return 'N/A';
  };

  const buildRestaurantList = (restaurant, element) => {
    const saveMode = element.attr('id') === 'saved-restaurant-list';
    const btnText = saveMode ? 'Delete' : 'Save';
    const btnClick = saveMode ? removeRestaurant : saveRestaurant;
    element.append(
      `<tr data-toggle="collapse" data-target=".${btnText + restaurant.camis}" id=${restaurant.camis}>
        <td scope="row"> ${restaurant.dba} </td>
        <td> ${restaurant.address} </td>
        <td> ${restaurant.inspection_date} </td>
        <td> ${["A", "B", "C"].indexOf(restaurant.grade) != -1 ? restaurant.grade : "Not Graded. " + gradePoints(restaurant.score)} </td>
        <td> ${restaurant.score ? restaurant.score : 'N/A'} </td>
        <td> <button type="button" class="btn ${saveMode ? 'btn-danger' : 'btn-primary'} btn-sm"> ${btnText} </button> </td>
      </tr>`
    );
    restaurant.violations.forEach(violation => {
      element.append(
        `<tr class="collapse ${btnText + restaurant.camis}" data-toggle="collapse" data-target=".${btnText + restaurant.camis}">
          <td scope="row" colspan="2"> ${violation.violation_description ? violation.violation_description : 'no violation :)'} </td>
          <td> ${violation.inspection_date.slice(0, violation.inspection_date.indexOf('T'))} </td>
          <td> ${violation.grade ? violation.grade : gradePoints(violation.score)} </td>
          <td> ${violation.score ? violation.score : 'N/A'} </td>
        </tr>`
      );
    });
    element.find(`#${restaurant.camis} button`).bind('click', (e) => {
      e.stopPropagation();
      btnClick(restaurant);
    });
  };

  const sortViolations = (a, b) => {
    if (a.inspection_date < b.inspection_date)
      return 1;
    if (a.inspection_date > b.inspection_date)
      return -1;
    return 0;
  };

  const extractAddress = (violation) => {
    return `${violation.building} ${violation.street} ${violation.boro}, ${violation.zipcode}`;
  };

  const search = () => {
    $restaurantList.empty();
    const term = $input.val();
    const query = `$where=DBA%20like%20%22%25${term.toUpperCase()}%25%22`;
    $.ajax({
      url: `https://data.cityofnewyork.us/resource/9w7m-hzhe.json?${query}`,
      success: function (violations) {
        violations.sort(sortViolations);
        const restaurants = {};
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
              score: violation.score,
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

  browserStorage.local.get(['restaurants'], function (result) {
    savedRestaurants = result.restaurants ? result.restaurants : [];
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
            score: latestViolation.score
          };
          buildRestaurantList(restaurant, $savedRestaurantList);
        }
      });
    });
  });
  $searchBtn.bind('click', search);
  $input.keyup(function(event) {
    if (event.keyCode === 13) {
      search();
    }
  });
});
