let savedRestaurants = [];

const buildRestaurantList = (restaurants, element) => {
  restaurants.forEach(restaurant => {
    element.append(`
    <div>
      ${restaurant}
    </div>`);
  });
};

chrome.storage.local.get(['restaurants'], function(result) {
  savedRestaurants = result.key ? result.key : [1, 2, 3, 4, 5];
  buildRestaurantList(savedRestaurants, $('#saved-restaurant-list'));
});


const handle = function (data) {
  console.log(data);
};

const search = function (term) {
  const businessName = term.toUpperCase();
  const socrataQuery = `boro=MANHATTAN&$where=DBA%20like%20%27%25${businessName}%25%27`;
  $.ajax({
    url: `https://data.cityofnewyork.us/resource/9w7m-hzhe.json?${socrataQuery}`,
    success: function (result) {
      handle(result);
    }
  });
};

search("sophie");
