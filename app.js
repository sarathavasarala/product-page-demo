/* ======= Getting Data ======= */

var model;
$.getJSON("https://test-prod-api.herokuapp.com/products", function(json){
    model = json;
    hub.init();
    $(".loader").fadeOut("slow");
});

/* ======= Setting Controls ======= */

var hub = (function(){
    var jsonDuplicate, itemsPerPage = 9, pageNo = 0, uniqueCategories = [], selectedCategories = [];

    function copyData(){
        jsonDuplicate = model.products;
    }

    function getItemsPerPage(){
        return itemsPerPage;
    };

    function getPageNo() {
        return pageNo;
    };

    function setPageNo(number){
        pageNo = number;
    };

    function incrPageNo(){
        pageNo++;
    };

    function getUniqueCategories(){
        return uniqueCategories;
    };

    function getSelectedCategories(){
        return selectedCategories;
    };

    function setSelectedCategories(catArray){
        selectedCategories = catArray;
    };

    function getAllItems(){
        return jsonDuplicate;
    };

    function setItems(args){
        jsonDuplicate = args;
    };

    function getFilteredItems(){
        return hub.getSelectedCategories().length == 0 ? hub.getAllItems() : hub.getAllItems().filter(function(data){
            return $.inArray(data.cat, hub.getSelectedCategories()) === -1 ? false : true;
        });
    };

    function paginate(allFilteredItems, itemsPerPage, page){
        var start = itemsPerPage * page;
        var end = start + itemsPerPage;
        return allFilteredItems.slice(start, end);
    };

    function sortBy(sortType){
      if(sortType === "price-asc"){
        return hub.getFilteredItems().sort(function(a, b) {
            return parseFloat(a.price) - parseFloat(b.price);
        });
      }
      else if(sortType === "price-des"){
        return hub.getFilteredItems().sort(function(a, b) {
            return parseFloat(b.price) - parseFloat(a.price);
        });
      }
      else if(sortType === "score-asc"){
        return hub.getFilteredItems().sort(function(a, b) {
          return parseFloat(a.score) - parseFloat(b.score);
        });
      }
      else if(sortType === "score-des"){
        return hub.getFilteredItems().sort(function(a, b) {
          return parseFloat(b.score) - parseFloat(a.score);
        });
      }
      else{
        return hub.getFilteredItems();
      }
    };

    function resetItemView(){
        hub.setPageNo(0);
        itemView.empty();
        itemView.render();
    };

    function init(){
        // copying json to a variable.
        hub.copyData();

        // rendering the product and category views.
        itemView.render();
        categoryView.render();
    };

    return {
        copyData: copyData,
        getItemsPerPage: getItemsPerPage,
        resetItemView: resetItemView,
        getPageNo: getPageNo,
        setPageNo: setPageNo,
        incrPageNo: incrPageNo,
        getSelectedCategories: getSelectedCategories,
        setSelectedCategories: setSelectedCategories,
        getUniqueCategories: getUniqueCategories,
        getAllItems: getAllItems,
        setItems: setItems,
        getFilteredItems: getFilteredItems,
        paginate: paginate,
        sortBy: sortBy,
        init: init
    };
})();


/* ======= Rendering View ======= */

var itemView = {
    empty: function(){
        $(".product-container").empty();
    },
    render: function() {
        win = $(window);

        /* storing the filtered object in allFilteredItems */
        var allFilteredItems = hub.getFilteredItems();

        /* sending the filtered object to a paginate function
        that returns 9 items */
        var result = hub.paginate(allFilteredItems, hub.getItemsPerPage(), hub.getPageNo());

        /* looping over the result and rendering */
        $.each(result, function(i, data) {
            parent = $('<div class = "product"></div>');
            imgContain = $('<div class = "text-center product-image-container"></div>');
            productMeta = $('<div class = "product-meta"></div>');
            imgContain.append("<img class = 'product-image' src = '" + result[i].img + "' data-failover='fallback.png' alt = 'thumbnail'/>");
            parent.append(imgContain);
            parent.append("<div class = 'product-category text-muted'>" + result[i].cat + "</div>");
            parent.append("<div class = 'product-name'>" + result[i].name + "</div>");
            productMeta.append("<div class = 'price'><span class = 'text-muted'>$</span>" + result[i].price + "</div>");
            productMeta.append("<div class = 'score'> Score: " + result[i].score.toFixed(3) + "</div>");
            parent.append(productMeta);
            $(".product-container").append(parent);
        });

        /* pagination */
        win.on('scroll', function() {
            if ($(document).height() - win.height() === win.scrollTop()) {
                hub.incrPageNo();
                itemView.render();
            }
        });

        /* sort */
        $('select').on('change', function() {
            var sortType = $(this).children(":selected").data('attr');
            var sorted = hub.sortBy(sortType);
            hub.setItems(sorted);
            hub.resetItemView();
        });
    }
};

var categoryView = {
    render: function(){

        // getting all the different product categories from the JSON file.
        var uniqueCategories = hub.getUniqueCategories();
        var catArray = [];
        $.each(hub.getAllItems(), function(i, data) {
            if ($.inArray(data.cat, uniqueCategories) === -1) {
                uniqueCategories.push(data.cat);
            }
        });

        // render each unique category (jeans, sarees, etc.) + checkbox on the page
        $.each(uniqueCategories, function(i, data) {
            parent = $("<div class = 'category'></div>");
            parent.append('<label><input class = "category-checkbox" type = "checkbox" value =' + uniqueCategories[i] + '>' + uniqueCategories[i] + '</label>');
            $(".category-container").prepend(parent);
        });

        // building an array of selected categories and sending it to the 'hub',
        // which in turn calls itemView.render()

        $('.category-checkbox').change(function() {
            if($(this).is(":checked")) {
                if($.inArray($(this).val(), catArray) === -1){
                    catArray.push($(this).val());
                }
                hub.setSelectedCategories(catArray);
                hub.resetItemView();
            }
            else {
                var removeItem = $(this).val();
                catArray = jQuery.grep(catArray, function(value) {
                  return value != removeItem;
                });
                hub.setSelectedCategories(catArray);
                hub.resetItemView();
            }
        });
    }
}
