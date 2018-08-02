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

$.ajax({url: "https://data.cityofnewyork.us/resource/9w7m-hzhe.json?dba=SOPHIE'S CUBAN CUISINE", success: function(result){
  console.log(result);
}});
